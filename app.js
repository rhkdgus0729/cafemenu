
const express = require('express');
const db = require('./db');

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static('public'));

// 전체 메뉴 조회 및 검색
app.get('/', (req, res) => {
    const q = req.query.q || '';
    const category = req.query.category || '전체';

    let sql = 'SELECT * FROM cafe_menu WHERE 1=1';
    const params = [];

    // 메뉴 이름 검색
    if (q.trim() !== '') {
        sql += ' AND menu LIKE ?';
        params.push(`%${q.trim()}%`);
    }

    // 카테고리 필터
    if (category !== '전체') {
        sql += ' AND category = ?';
        params.push(category);
    }

    sql += ' ORDER BY id ASC';

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.send('메뉴 조회 실패');
        }

        res.render('index', {
            menus: results,
            search: q,
            selectedCategory: category
        });
    });
});

// 메뉴 추가
app.post('/menu/add', (req, res) => {
    const { category, menu, price } = req.body;

    const sql = 'INSERT INTO cafe_menu (category, menu, price) VALUES (?, ?, ?)';

    db.query(sql, [category, menu, price], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('메뉴 추가 실패');
        }

        res.redirect('/');
    });
});

// 메뉴 수정 페이지 조회
app.get('/menu/edit/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM cafe_menu WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.send('메뉴 조회 실패');
        }

        if (results.length === 0) {
            return res.send('해당 메뉴가 없습니다.');
        }

        res.render('edit', { menu: results[0] });
    });
});

// 메뉴 수정 처리
app.post('/menu/edit/:id', (req, res) => {
    const id = req.params.id;
    const { category, menu, price } = req.body;

    const sql = 'UPDATE cafe_menu SET category = ?, menu = ?, price = ? WHERE id = ?';

    db.query(sql, [category, menu, price, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('메뉴 수정 실패');
        }

        res.redirect('/');
    });
});

// 메뉴 삭제 처리
app.post('/menu/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM cafe_menu WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.send('메뉴 삭제 실패');
        }

        res.redirect('/');
    });
});

module.exports = app;

