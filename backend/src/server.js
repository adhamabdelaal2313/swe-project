const app = require('./index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is happily listening on port ${PORT}`);
});

