//atualizar o texto da task 
const express = require ('express');
const mysql = require('mysql2');
const cors = require('cors');

const mysql_config = require ('./inc/mysql_config');
const functions = require('./inc/functions');
const { json } = require('express');

//2 criação de duas constantes para a definição da disponibilidade da api e da versão da api
const API_AVAILABILITY = true;
const API_VERSION = "4.0.0";

const app = express()
app.listen(3000,()=>{
    console.log("APi esta executando")
})



app.use((req,res,next)=>{
    if(API_AVAILABILITY){
        next();
    }else{
        res.json(functions.response("Atenção", "API esta em manutenção. Sinto muito",0,null))
    }
})



const connection = mysql.createConnection(mysql_config);



app.use(cors());

//tratamento dos posts params 
app.use(json());
//instrução que pede que o express trate os dados com json

app.use(express.urlencoded({extended: true}));

//quando é enviado um pedido atraves do metodo post, os dados enviados atráves de um formulário podem ser interpretados
//SEM ESSES DOIS MIDLEWARE NÃO SERIA POSSIVEL BUSCAR OS PARAMETROS

//ROTAS
//rota de entrada
app.get('/',(req,res)=>{
    res.json(functions.response('sucesso','api esta rodando',0,null))
})

//rota para pegar todas as tarefas
app.get('/tasks', (req,res)=>{
     connection.query("SELECT * FROM tasks",(err,rows))
})

//rota para pegar a task pelo id
app.get("/tasks/:id",(req,res)=>{
    const id = req.params.id;
    connection.query('SELECT *FROM tasks WERE id=?',(id),(err,rows)=>{
        if(err){
            //devolver os dados da task
            if(rows.lenght>0){
                res.json(functions.response("Sucesso","Sucesso na pesquisa",rows.lenght,rows))
            }else{
                res.json(functions.response('Atenção', 'Não foi possivel encontrar a task solicitada',0,null))
            }
        }
        else{
            res.json(functions.response("error",err.message,0,null))
        }
    })
})

//rotas para atualizar o status de uma task  metodo put 
app.put('/tasks/:id status/ status',(req,res)=>{
    const id = req.params.id;
    const status = req.params.status;
    connection.query('UPDATE tasks SET status =? WHERE id =?  ',(status,id),(err,rows)=>{
        if (!err){
            if(rows.affectedRows>0){
                res.json(functions.response('Sucesso', 'Sucesso na alteração do status',rows.affectedRows,null))
            }
            else{
                res.json(functions.response('Atenção','Task não encontrada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//rota para deletar uma tarefa
app.delete('/tasks/:id/delete', (req,res)=>{
    const id = req.params.id;
    connection.query('DELETE FROM tasks WERE id=?',[id],(err,rows)=>{
        if(!err){
            if(rows.affectedRows>0){
                res.json(functions.response('Sucesso','Tasks deletada', rows.affectedRows,null))
            }
            else{
                res.json(functions.response('Atenção','Task não encontrada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})


//rota para inserir uma nova task
app.put('/tasks/create',(req,res)=>{
    //midleware para a recepção dos dados da tarefa (task)

    //pegando os dados da request
    const post_data= req.body;

    //checar se não estamos recebendo json vazia
    if(post_data ==undefined){
        res.json(functions.response('Atenção','Sem dados de uma nova task',0,null))
        return;
    }
    const task = post_data.task;
    const status = post_data.status;

    //Inserindo a nova task 
    connection.query('INSERT INTO tasks(task,status,created_at,update_at) VALUES(?,?,NOW(),NOW()',[task,status],(err,rows)=>{
        if(!err){
            res.json("Sucesso","Task cadastrada no banco",rows.affectedRows,null)
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
   
})


//rota para atualizar o texto de uma task
//o texto da task sera enviado atraves do body

app.put('/tasks/:id/update',(req,res)=>{
    const id = req.params.id;
    const post_data = req.body;
    //checar se os dados estao vazios 
    if(post_data==undefined){
        res.json(functions.response('Atenção', ' Sem dados para uma nova task',0,null))
        return
    }
    //checar se os dados são validos 
    if(post_data.task == undefined || post_data.status == undefined){
        res.json(functions.response('Atenção', 'Dados ivalidos',0,null))
        return
    }
    //declara as variaveis para recpecionar as informações da task
    const task = post_data.task;
    const status = post_data.status;

    //atualização dos dados 
    connection.query('UPDATE tasks SETE task =?, upadate_at = NOW() WHERE id=?',(task,status,id),
        (err,rows)=>{
            if(!err){
                if(!err){
                    res.json(functions.response("Sucesso","Task atualizada",rows.affectedRows,null))
                }else{
                    res.json(functions.response("Atenção", "Task não encontrada",rows.affectedRows,null))
                }
            }else{
                res.json(functions.response('Erro',err.message,0,null));
            }
        }
    )

})


//mydlware para caso alguma rota não seja encontrada 

app.use((req,res)=>{
    res.json(functions.response('Atenção','rota não encontrada',0,null))
})