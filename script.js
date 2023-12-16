document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.search-button');
    const inputKeyword = document.querySelector('.input-keyword');
    const movieContainer = document.querySelector('.movie-container');
    const modalBody = document.querySelector('.modal-body');
    
    // Mendapatkan data cache dari localStorage saat DOM dimuat
    let movieDetailCache = JSON.parse(localStorage.getItem('movieDetailCache')) || {};

    searchButton.addEventListener('click', searchMovie);
    inputKeyword.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') searchMovie();
    })

    async function searchMovie() {
        try {
            const response = await fetch(`https://www.omdbapi.com/?apikey=f92ebe5a&s=${inputKeyword.value}`);
            if (!response.ok) {
                throw new Error(`Terjadi kesalahan : ${response.status} - ${response.statusText}`);
            }
            const data = await response.json();
            const movies = data.Search;
            let cards = '';
            movies.forEach((movie) => (cards += showCards(movie)));
            movieContainer.innerHTML = cards; 

            movieContainer.addEventListener('click', async (event) => {
                if (event.target.classList.contains('modal-detail-button')) {
                    const imdbid = event.target.dataset.imdbid;
                    if (movieDetailCache[imdbid]) {
                        const movieDetail = showMovieDetail(movieDetailCache[imdbid]);
                        modalBody.innerHTML = movieDetail;
                    } else {
                        const movieDetailResponse = await fetch(`https://www.omdbapi.com/?apikey=f92ebe5a&i=${imdbid}`);
                        if (!movieDetailResponse.ok) {
                            throw new Error(`Terjadi kesalahan : ${movieDetailResponse.status} - ${movieDetailResponse.statusText}`);
                        }
                        const movieDetailData = await movieDetailResponse.json();
                        movieDetailCache[imdbid] = movieDetailData;
                        const movieDetail = showMovieDetail(movieDetailData);
                        modalBody.innerHTML = movieDetail;
                        
                        // Simpan cache ke localStorage secara asinkron setelah mendapatkan data detail film
                        setTimeout(() => {
                            localStorage.setItem('movieDetailCache', JSON.stringify(movieDetailCache));
                        }, 0);
                    }
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    function showCards(movie) {
        return `<div class="col-md-4 my-3">
                      <div class="card">
                          <img src="${movie.Poster}" class="card-img-top">
                          <div class="card-body">
                          <h5 class="card-title">${movie.Title}</h5>
                          <h6 class="card-subtitle mb-2 text-body-secondary">${movie.Year}</h6>
                          <a href="#" class="btn btn-primary modal-detail-button" data-imdbid="${movie.imdbID}" data-bs-toggle="modal" data-bs-target="#movieDetailModal">Show Details</a>
                          </div>
                      </div>
                  </div>`;
    }

    function showMovieDetail(movie) {
        return `<div class="container-fluid">
                      <div class="row">
                          <div class="col-md-3">
                              <img src="${movie.Poster}" class="img-fluid">
                          </div>
                          <div class="col-md">
                              <ul class="list-group">
                                  <li class="list-group-item"><h4>${movie.Title}</h4></li>
                                  <li class="list-group-item"><strong>Director : </strong>${movie.Director}</li>
                                  <li class="list-group-item"><strong>Actors : </strong>${movie.Actors}</li>
                                  <li class="list-group-item"><strong>Writers : </strong>${movie.Writer}</li>
                                  <li class="list-group-item"><strong>Plot : </strong> <br> ${movie.Plot}</li>
                              </ul>
                          </div>
                      </div>
                  </div>`;
    }
});
