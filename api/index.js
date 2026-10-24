const express = require('express');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// Inisialisasi Firebase Admin dengan Environment Variable
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const db = admin.firestore();
const booksCollection = db.collection('books');

// Endpoint: Ambil Semua Buku
app.get('/api/books', async (req, res) => {
  try {
    const snapshot = await booksCollection.get();
    const books = [];
    snapshot.forEach(doc => {
      books.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Tambah Buku Baru
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, year } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: 'Judul dan Penulis harus diisi!' });
    }

    const newBook = {
      title,
      author,
      year: parseInt(year) || new Date().getFullYear(),
      createdAt: new Date().toISOString()
    };

    const docRef = await booksCollection.add(newBook);
    res.status(201).json({ id: docRef.id, ...newBook });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: Hapus Buku
app.delete('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await booksCollection.doc(id).delete();
    res.status(200).json({ message: 'Buku berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export handler untuk Vercel Serverless Function
module.exports = app;