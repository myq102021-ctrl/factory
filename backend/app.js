
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Using promise-based MySQL
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Connection Config
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password', // Replace with actual env variable
    database: 'spacetime_factory',
    dateStrings: true
};

// Helper: Get DB Connection
async function getDb() {
    return await mysql.createConnection(dbConfig);
}

// ==========================================
// 1. Algorithm & System Routes
// ==========================================

// GET /api/algorithms - Fetch all definitions for the sidebar
app.get('/api/algorithms', async (req, res) => {
    const conn = await getDb();
    try {
        const [rows] = await conn.execute('SELECT * FROM algorithm_defs ORDER BY category, id');
        res.json({ code: 200, data: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        conn.end();
    }
});

// GET /api/system/page-tips - Dynamic UI tips
app.get('/api/system/page-tips', async (req, res) => {
    const { route } = req.query;
    const conn = await getDb();
    try {
        const [rows] = await conn.execute('SELECT * FROM page_tips WHERE route_key = ?', [route]);
        res.json({ code: 200, data: rows[0] || null });
    } finally {
        conn.end();
    }
});

// ==========================================
// 2. Pipeline Routes (List & Flow)
// ==========================================

// GET /api/pipelines - Dual list support via 'status' query
// status=0: Drafts, status=1: Formal
app.get('/api/pipelines', async (req, res) => {
    const { status = 1, page = 1, pageSize = 10, keyword = '' } = req.query;
    const offset = (page - 1) * pageSize;
    const conn = await getDb();
    
    try {
        let query = 'SELECT * FROM pipelines WHERE status = ?';
        const params = [status];

        if (keyword) {
            query += ' AND name LIKE ?';
            params.push(`%${keyword}%`);
        }

        query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));

        const [rows] = await conn.execute(query, params);
        
        // Get Total Count
        const [countRows] = await conn.execute('SELECT COUNT(*) as total FROM pipelines WHERE status = ?', [status]);
        
        res.json({
            code: 200,
            data: {
                list: rows,
                total: countRows[0].total,
                page: parseInt(page),
                pageSize: parseInt(pageSize)
            }
        });
    } finally {
        conn.end();
    }
});

// GET /api/pipelines/:id/flow - Link list click to bottom flow chart
app.get('/api/pipelines/:id/flow', async (req, res) => {
    const { id } = req.params;
    const conn = await getDb();
    try {
        // Retrieve the JSON layout directly
        const [rows] = await conn.execute('SELECT canvas_json FROM pipeline_layouts WHERE pipeline_id = ?', [id]);
        if (rows.length > 0) {
            res.json({ code: 200, data: rows[0].canvas_json });
        } else {
            // Return empty structure if no layout exists yet
            res.json({ code: 200, data: { nodes: [], connections: [] } });
        }
    } finally {
        conn.end();
    }
});

// POST /api/pipelines - Create or Update (Save Draft / Submit)
app.post('/api/pipelines', async (req, res) => {
    const { id, name, code, type, status, canvasData, description } = req.body;
    const conn = await getDb();
    
    try {
        await conn.beginTransaction();

        // 1. Upsert Pipeline Header
        const sqlPipeline = `
            INSERT INTO pipelines (id, name, code, type, status, description, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            name=VALUES(name), status=VALUES(status), description=VALUES(description), updated_at=NOW()
        `;
        await conn.execute(sqlPipeline, [id, name, code, type, status, description]);

        // 2. Upsert Layout JSON
        const sqlLayout = `
            INSERT INTO pipeline_layouts (pipeline_id, canvas_json)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE canvas_json=VALUES(canvas_json)
        `;
        await conn.execute(sqlLayout, [id, JSON.stringify(canvasData)]);

        await conn.commit();
        
        res.json({ code: 200, message: 'Saved successfully' });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ error: e.message });
    } finally {
        conn.end();
    }
});

// DELETE /api/pipelines/:id
app.delete('/api/pipelines/:id', async (req, res) => {
    const { id } = req.params;
    const conn = await getDb();
    try {
        await conn.execute('DELETE FROM pipelines WHERE id = ?', [id]); // Cascade deletes layout
        res.json({ code: 200, message: 'Deleted' });
    } finally {
        conn.end();
    }
});

// ==========================================
// 3. Resource Matching Route (The Core Feature)
// ==========================================

// POST /api/service/match-resources - Unified Resource Matching Logic
// This replaces/standardizes the previous /api/resources/search
app.post('/api/service/match-resources', async (req, res) => {
    const { path, rules, file_type } = req.body; 
    // rules example: [{ type: 'GF1', payload: 'PMS', regex: '.*.tiff' }]
    
    const conn = await getDb();
    try {
        // Base query
        let sql = "SELECT * FROM data_resources WHERE 1=1";
        const params = [];

        // 1. Path Filtering
        if (path) {
            sql += " AND file_path LIKE ?";
            params.push(`${path}%`);
        }

        // 2. File Type Filtering
        if (file_type) {
            sql += " AND file_type = ?";
            params.push(file_type);
        }

        // 3. Rule Matching (Complex Logic)
        if (rules && rules.length > 0) {
            const ruleClauses = [];
            
            rules.forEach(rule => {
                const conditions = [];
                if (rule.type) conditions.push(`satellite_type = '${rule.type}'`);
                if (rule.payload) conditions.push(`sensor = '${rule.payload}'`);
                if (rule.regex) conditions.push(`name REGEXP '${rule.regex}'`);
                if (rule.code) conditions.push(`name LIKE '%${rule.code}%'`);
                
                if (conditions.length > 0) {
                    ruleClauses.push(`(${conditions.join(' AND ')})`);
                }
            });

            if (ruleClauses.length > 0) {
                sql += ` AND (${ruleClauses.join(' OR ')})`;
            }
        }

        const [rows] = await conn.execute(sql, params);

        if (rows.length === 0) {
            res.json({ code: 200, data: [], message: '暂无可以匹配的数据资源，请重新配置规则或前往数据管理添加资源' });
        } else {
            res.json({ code: 200, data: rows });
        }

    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        conn.end();
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Space-Time Factory Backend running on port ${PORT}`);
});
