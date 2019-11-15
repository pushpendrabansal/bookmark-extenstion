var data={};

// update bookmark data
function updateData(){
	chrome.storage.sync.set({bookmark_data: data});
}

// display data onnclick
chrome.storage.sync.get('bookmark_data', function(a) {
	data=a.bookmark_data || {};
  // if url is already bookmarked then hide the add to bookmark button
  chrome.tabs.query({currentWindow: true, active: true},function(tabs){
    let url = tabs[0].url;
    for(let key in data){
      data[key].forEach(function(i){
        if(i.url==url){
          document.getElementById('addToBookmark').style.display='none';
        }
      });
    }
  }); 
  display();
});	

// when user add page to bookmark
document.getElementById('addToBookmark').addEventListener('click',function(){
	document.getElementById('categories').style.display="none";
	chrome.tabs.query({currentWindow: true, active: true},function(tabs){
		showForm(tabs[0].title,tabs[0].url);
		document.getElementById('title_input').value=tabs[0].title;
	});
});

// show form when user add page to bookmark
function showForm(title,url){
	document.getElementById('form').style.display="block";
	document.getElementById('addToBookmark').style.display="none";
	var keys = Object.keys(data);
	autocomplete(document.getElementById('category_input'),keys);
	document.getElementById('add').addEventListener('click',function(){
		let category = document.getElementById('category_input').value;
		let t = document.getElementById('title_input').value;
    let note = document.getElementById('note_input').value;
		if(category==null || t==null || category.length==0 || title.length==0){
			showError();
		}else{
			if(data[category]!=undefined){
				data[category].push({
					'title':t,
					'url':url,
          'note':note
				})
			}else{
				data[category]=[];
				data[category].push({
					'title':t,
					'url':url,
          'note':note
				});
			}
			hideForm();
			updateData();
			display();
		}
	});
}

// Hide form after adding page to bookmark
function hideForm(){
	document.getElementById('form').style.display="none";
}

// show error when any field is empty
function showError(){
	document.getElementById('error').innerHTML='Please fill both the fields';
  setTimeout(function(){
    document.getElementById('error').innerHTML='';
  },5000);
}

// Display all the bookmarks
function display(){
	let temp = '<ul class="category" id="category">';
	for(let key in data){
		temp+=` <li data-key="${key}" class="category_list">
					<h2 class="title">${key}</h2>
					<span class="icon trash"><i class="fa fa-trash"></i></span>
				</li>`;
	}
	temp+='</ul>';
	document.getElementById('categories').innerHTML=temp;
	document.getElementById('categories').style.display="block";
	var classname = document.getElementsByClassName("category_list");
	for (var i = 0; i < classname.length; i++) {
    	classname[i].addEventListener('click', function(e){
    		var key = this.getAttribute("data-key");
    		if(e.target.classList.contains('fa-trash')){
    			remove(key,1);
    		}else{
    			expand(key);
    		}
    	});
	}
}

// Display bookbarks
function expand(key){
	document.getElementById('categories').style.display='none';
	let temp="<ul class='bookmark' id='bookmark'>";
	data[key].forEach(function(i,j){
		temp+=`	<li title="'${i.url}'" data-key="${key}" data-j="${j}" data-url="${i.url}" class="bookmark_list">
					<h2 class="title">${i.title}></h2>
          <h3 class="link">${i.url}</h3>
          <p class="note">${i.note}</p>
					<span class="icon"><i class="fa fa-trash"></i></span>
				</li>`;
	});
	temp+='</ul><p id="back" class="addToBookmark"><i class="fa fa-arrow-circle-o-left"></i> back</p>';
	document.getElementById('bookmarks').innerHTML=temp;
	document.getElementById('bookmarks').style.display='block';
	var classname = document.getElementsByClassName("bookmark_list");
	for (var i = 0; i < classname.length; i++) {
    	classname[i].addEventListener('click', function(e){
    		var key = this.getAttribute("data-key");
    		var j = this.getAttribute("data-j");
    		var url = this.getAttribute("data-url");
    		if(e.target.classList.contains('fa-trash')){
    			remove(key,2,j);
    		}else{
    			window.open(url,'_blank');
    		}
    	});
	}
	document.getElementById('back').addEventListener('click',function(){
		document.getElementById('bookmarks').style.display='none';
		document.getElementById('categories').style.display="block";
	});
}

function remove(key,type,j=null){
	if(type==1){
		delete data[key];
		updateData();
		display();
	}else{
		delete data[key][j];
		updateData();
		expand(key);
	}
}

function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          b = document.createElement("DIV");
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) { //up
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}
