const express = require('express');
const axios = require('axios');
const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { temperature: null, location: null, error: null, status: null, weatherIcon: null , countryCode: null});
});

app.post('/weather', async (req, res) => {
    const location = req.body.location;

    try {
        // Ambil koordinat berdasarkan nama lokasi
        const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
            params: { name: location }
        });

        // Log pemberitahuan jika berhasil ambil data API dari Geocoding
        console.log('Pengambilan data dari Geocoding API berhasil:', geoResponse.data);

        // Mengecek apakah geoResponse.data.results tidak ada atau bernilai falsy
        if (!geoResponse.data.results) {
            return res.render('index', { temperature: null, location: null, error: 'Lokasi tidak ditemukan.', status: 'Data API tidak berhasil diambil.', weatherIcon: null });
        }

        const { latitude, longitude, country_code } = geoResponse.data.results[0];

        // Ambil data cuaca berdasarkan koordinat
        const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: latitude,
                longitude: longitude,
                hourly: 'temperature_2m'
            }
        });

        const temperature = weatherResponse.data.hourly.temperature_2m[0];
        
        // Logika untuk menentukan ikon cuaca
        let weatherIcon; // Variabel untuk menyimpan ikon cuaca

        if (temperature > 25) {
            weatherIcon = "☀️"; 
        } else if (temperature < 15) {
            weatherIcon = "❄️"; 
        } else if (temperature > 30) {
            weatherIcon = "🔥"; 
        } else {
            weatherIcon = "🌧️"; 
        }

        // Mengirimkan data ke template
        res.render('index', { temperature, location, error: null, status: 'Data API berhasil diambil.', weatherIcon , countryCode : country_code});

    } catch (error) {
        console.error(error);
        res.render('index', { temperature: null, location: null, error: 'Gagal mengambil data cuaca.', status: 'Data API tidak berhasil diambil.', weatherIcon: null ,countryCode : country_code });
    }
});

app.listen(port, () => {
    console.log(`The weather app is listening on port ${port}`);
});
