const express = require("express");
const path = require("path")
const session = require("express-session")
const mysql = require("mysql")


app = express()
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"))
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(session({
    secret: "qwertyuam",  
    resave: false,
    saveUninitialized: true
}));
const conn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"studenthelper"
})

conn.connect((err)=>{
    if(err) throw err;
    console.log("connected")
})

let userid = 1;
let user;


app.get("/home",(req,res)=>{
    res.render("home", {"user":user})
})


app.get("/schedule",(req,res)=>{
    res.render("schedule",{"user":user})
})

app.get("/find",(req,res)=>{
    res.render("FindSched",{"user":user})
})

app.get("/expenses",(req,res)=>{
    res.render("expense",{"user":user})
})

app.get("/profile",(req,res)=>{
    res.render("profile", {"user":user})
})


app.get("/logout",(req,res)=>{
    user = {}
    req.session.destroy((err)=>{
        res.redirect("/")
    })
})

function isSession(req,res,next){
    if(!req.session.user){
        res.redirect("/")
    }
    next()
}

app.post("/signin", (req, res) => {
    const { name, password } = req.body;
    console.log(req.body)

    if (!name || !password) {
        return res.json({ status: "failed", message: "Please fill" });
    }

    conn.query("SELECT * FROM users WHERE name = ? AND password = ?", [name, password], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.json({ status: "error", message: "Database error" });
        }
        if (result.length > 0) {
            req.session.user = {
                id:result[0].id,
                name:result[0].name,
                email:result[0].email,
                password:result[0].password,
                profile:result[0].profile
            }

            user = req.session.user;

            res.json({ status: "accept"});
            

            return
        } else {
            res.json({ status: "failed", message: "Invalid username or password" });
            return;
        }
    });
});

app.post("/signup", (req, res) => {
    const { name, email, password, cpass} = req.body;

    if (!name || !email || !password) {
        return res.json({ status: "failed", message: "All fields are required" });
    }

    if (password != cpass) {
        return res.json({ status: "failed", message: "Password Not match" });
    }


    conn.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.json({ status: "error", message: "Database error" });
        }

        if (result.length > 0) {
            return res.json({ status: "failed", message: "Email already registered" });
        }

        const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        conn.query(insertSql, [name, email, password], (err2) => {
            if (err2) {
                console.error("Insert error:", err2);
                return res.json({ status: "error", message: "Failed to register" });
            }

            res.json({ status: "accept", message: "Account created successfully" });
            return
        });
    });
});


app.get("/schedule/sched",(req,res)=>{
    conn.query("SELECT * FROM schedule WHERE userid = ?",req.session.user.id,(err,result)=>{
        if(err) console.log(err);
        res.json(result)
    })
})

app.post("/schedule/delete",(req,res)=>{
    conn.query("DELETE FROM schedule WHERE userid = ? AND id = ?",[req.session.user.id,Number(req.body.id)],(err, result)=>{
        if(err) console.log(err);

        res.json({"response":"success"})
    })

})

app.post("/profile/update",(req,res)=>{
    let {fullname,email,password} = req.body
    conn.query("UPDATE users SET name=?, email=?,password=? WHERE id = ?",[fullname,email,password,req.session.user.id],(err,result)=>{
        if(err) console.log(err);
        req.session.user = {
            id:req.session.user.id,
            name:fullname,
            "email":email,
            "password":password,
            profile:req.session.user.profile
        }

        user = req.session.user
        res.redirect("/home")
    })
})

app.post("/schedule/add",(req,res)=>{
    let body = req.body
    delete body.id
    delete body.ownerid

    let sql = "INSERT INTO schedule(userid,startt_time,end_time,day,label,overlapse,position, location) VALUES (?,?,?,?,?,?,?,?)"
    let see = [user.id,...Object.values(body)]
    console.log(see)

    conn.query(sql,see,(err,result)=>{
        if(err) console.log(err);
        console.log("success")
        res.json({status:"success"})
    })
})

app.post("/find/getsched",(req,res)=>{
    conn.query("SELECT * FROM ownersched",(err,result)=>{
        if(err) console.log(err);
        res.json(result)
    })
})


app.post("/expenses/add",(req,res)=>{
    let {year,months} = req.body
    conn.query("INSERT INTO userexpense(userid,year,months) VALUES (?,?,?)",[user.id,year,months],(err)=>{
        if(err) console.log("201"+err)
        res.json({status:"accept",message:"added"})
    })
})

app.post("/expenses/load",(req,res)=>{
    conn.query("SELECT * FROM userexpense WHERE userid = ?",user.id,(err,result)=>{
        if(err) console.log(err)
        
        res.json({status:"accept","result":result})
    })
})



app.listen(3000,()=>{
    console.log("app is running http://localhost:3000")
})