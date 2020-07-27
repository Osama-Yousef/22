// requirement
require('dotenv').config();

// dependencies 

const pg=require('pg');
const cors=require('cors');
const superagent=require('superagent');
const methodOverride =require('method-override');
const express=require('express');

// main variables 

const client= new pg.Client(process.env.DATABASE_URL);
const app=express();
const PORT= process.env.PORT || 3030 ;


// uses 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public')); 
app.set('view engine', 'ejs');

// app.use(errorHandler);
// app.use('*',notFoundHandler);

// listen to port 

client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`listening on port ${PORT}`);
    })
})

///////////////////////////
// // check
// app.get('/',homeHandler);
// function homeHandler(req,res){
//     res.status(200).send('it works good');
// }

////////////////////////////////
////////route definitions////////////////

app.get('/',homeHandler);

app.get('/addToDb',addToDbHandler);

app.get('/selectData',selectDataHandler);

app.get('/details/:movie_id',detailsHandler);

app.put('/update/:update_id',updateHandler);


app.delete('/delete/:delete_id',deleteHandler);


////////

app.get('/searches',searchesHandler);

app.get('/search',searchHandler);




////////route handlers////////////////

function homeHandler(req,res){

let url=`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.MOVIE_API_KEY}`;

superagent.get(url).then(data=>{

    let moviesArray=data.body.results.map(val=>{
        return new Movies(val);
    })
    res.render('index',{data:moviesArray});
})


}
///////////////////////////////////////////////////

// constructor function

function Movies(val){

this.image=`https://image.tmdb.org/t/p/w600_and_h900_bestv2/${val.poster_path}` || 'no image' ;
this.title=val.title || 'no title';
this.language=val.original_language || '...';
this.vote=val.vote_average || 'no vote available' ;
this.overview=val.overview || '....';

}

////////////////////////////////////////////////////

function addToDbHandler(req,res){

let{ image,title,language,vote,overview}=req.query;
let sql=`INSERT INTO practiceetable (image,title,language,vote,overview) VALUES ($1,$2,$3,$4,$5) ;`;
let safeValues=[ image,title,language,vote,overview] ;

client.query(sql,safeValues).then(()=>{
    res.redirect('/selectData');
})

}

///////////////////////////////////////////////////

function selectDataHandler(req,res){

let sql=`SELECT * FROM practiceetable ; `;

client.query(sql).then(result=>{
    res.render('pages/favorite',{data:result.rows});
})


}

///////////////////////////////////////////////////

function detailsHandler(req,res){

let param=req.params.movie_id;
let sql=`SELECT * FROM practiceetable WHERE id=$1 ;`;
let safeValues=[param];

client.query(sql,safeValues).then(result=>{
    res.render('pages/details',{data:result.rows[0]});
})

}

//////////////////////////////////////////

function updateHandler(req,res){

    let{ image,title,language,vote,overview}=req.body;
    let param=req.params.update_id;
    let sql=`UPDATE practiceetable SET image=$1,title=$2,language=$3,vote=$4,overview=$5 WHERE id=$6 ;`;
let safeValues=[ image,title,language,vote,overview,param ] ;

client.query(sql,safeValues).then(()=>{
    res.redirect(`/details/${param}`);
})



}


//////////////////////////////////////////////////



function deleteHandler(req,res){

    let param=req.params.delete_id;
    let sql=`DELETE FROM practiceetable WHERE id=$1 ;`;
let safeValues=[param] ;

client.query(sql,safeValues).then(()=>{
    res.redirect('/selectData');
})


}

///////////////////////////////////////////

function searchesHandler(req,res){

res.render('pages/search');


}


//////////////////////////////////////



function searchHandler(req,res){


let title=req.query.title;
let type=req.query.radio;
let url=`https://api.themoviedb.org/3/search/${type}?api_key=${process.env.MOVIE_API_KEY}&query=${title}` ;

superagent.get(url).then(data=>{

    let moviesArray=data.body.results.map(val=>{
        return new Movies(val);
    })
    res.render('pages/result',{data:moviesArray});
})

}

//////////////////////////////////////////////////////






































// ////////////////////////////
// // error handler 
// function errorHandler(err,req,res){
//     res.status(500).send(err);
// }

// // not found handler

// function notFoundHandler(req,res){
//     res.status(404).send('page not found');
// }