const express = require('express');
const cors = require('cors');
const db = require('./event_db');

const app = express();
const PORT = Number(process.env.PORT || 3010);

app.use(cors());
app.use(express.json());

const SELECT_MEET = `
  SELECT
    e.id,
    e.name,
    e.short_description,
    e.full_description,
    e.purpose,
    e.event_date,
    e.location,
    e.ticket_price,
    e.goal_amount,
    e.current_amount,
    e.is_suspended,
    c.name AS category_name,
    o.name AS organisation_name,
    o.description AS organisation_description,
    o.contact_email,
    o.contact_phone,
    o.address
  FROM events e
  JOIN categories c ON c.id = e.category_id
  JOIN organisations o ON o.id = e.organisation_id
`;

function fail(res, status, message) {
  res.status(status).json({ error: message });
}

app.get('/public/meets', (req, res) => {
  const sql = `
    ${SELECT_MEET}
    WHERE e.is_suspended = 0
      AND e.event_date >= CURDATE()
    ORDER BY e.event_date ASC
  `;

  db.query(sql)
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      fail(res, 500, 'The listing could not be loaded.');
    });
});

app.get('/public/meets/query', (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date.trim() : '';
  const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';

  const clauses = ['e.is_suspended = 0'];
  const values = [];

  if (date) {
    clauses.push('DATE(e.event_date) = ?');
    values.push(date);
  }
  if (location) {
    clauses.push('e.location LIKE ?');
    values.push(`%${location}%`);
  }
  if (category) {
    clauses.push('c.name = ?');
    values.push(category);
  }

  const sql = `
    ${SELECT_MEET}
    WHERE ${clauses.join(' AND ')}
    ORDER BY e.event_date ASC
  `;

  db.query(sql, values)
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      fail(res, 500, 'The filter request failed.');
    });
});

app.get('/public/meets/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    fail(res, 400, 'The event id is not valid.');
    return;
  }

  const sql = `
    ${SELECT_MEET}
    WHERE e.id = ?
      AND e.is_suspended = 0
    LIMIT 1
  `;

  db.query(sql, [id])
    .then(([rows]) => {
      if (!rows.length) {
        fail(res, 404, 'That event is not available.');
        return;
      }
      res.json(rows[0]);
    })
    .catch((err) => {
      console.error(err);
      fail(res, 500, 'The event could not be loaded.');
    });
});

app.get('/kinds', (req, res) => {
  db.query('SELECT id, name FROM categories ORDER BY name ASC')
    .then(([rows]) => {
      res.json(rows);
    })
    .catch((err) => {
      console.error(err);
      fail(res, 500, 'The category list could not be loaded.');
    });
});

app.listen(PORT, () => {
  console.log(`Saltmarsh API on http://localhost:${PORT}`);
});
