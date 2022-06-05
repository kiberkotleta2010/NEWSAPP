// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          console.log(response)
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();
const newsService = (function(){
  const apiKey = 'b89f6ce9b82a44a28646121436b26120';
  const apiUrl = 'https://news-api-v2.herokuapp.com';
  return {
    topHeadLines (country = 'ru', cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`,
      cb,
      );
    },
    everything (query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`,
      cb);
    },
    category(category,country,cb) {
      http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
      cb);
    },
  };
})();
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search']; 
const categorySelect = form.elements['category'];
form.addEventListener('submit', e =>{
  e.preventDefault();
  loadNews();
})
//  init selects
document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});
// load news
function loadNews() {
  showLoader();
  const country =countrySelect.value;
  const searchText = searchInput.value;
  console.log(categorySelect.value);
  if(!searchText && categorySelect.value=="default"){
    newsService.topHeadLines(country, onGetResponse);
  }
  else if(searchText){
    newsService.everything(searchText,onGetResponse);
  }
  else {
    newsService.category(categorySelect.value,country,onGetResponse);
  }
  
}

//function on get response from server

function onGetResponse(err, res) {
  removePreloader();
  if(err){
    showAlert(err, 'error-msg');
  }
  if(!res.articles.length){
    alert('новостей неть');
    
    return
  }
  console.log(res.articles);
  renderNews(res.articles);
} 
// Function render NEws
function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if(newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';
  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment +=el;
  });
  console.log(fragment);
  newsContainer.insertAdjacentHTML("afterbegin",fragment);
}
function clearContainer(container){
  let child = container.lastElementChild;
  while(child){
    container.removeChild(child);
    child = container.lastElementChild;
  }
}
//NEws itrm Templte function
function newsTemplate({urlToImage, title, url, description}) {
  if(!urlToImage){`
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}<p>
        </div>
       <div class="card-action">
          <a href="${url}">Read more</a>
       </div>
      </div>
    </div>
  `
  }
  return`
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}<p>
        </div>
       <div class="card-action">
          <a href="${url}">Read more</a>
       </div>
      </div>
    </div>
  `
}

function showAlert(msg,type = 'success'){
  M.toast({ html: msg,classes: type});
}
function showLoader(){
  document.body.insertAdjacentHTML('afterbegin',
  `
  <div class="progress">
      <div class="indeterminate"></div>
  </div>
  ` ,   
  );
}
function removePreloader(){
  const loader = document.querySelector(".progress");
  if(loader){
    loader.remove();
  }
}