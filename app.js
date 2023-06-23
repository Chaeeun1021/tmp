var express = require('express');
const session = require('express-session');
var app = express();
// express-session 설정
app.use(session({
  secret: 'secret_key', // 세션 암호화에 사용되는 비밀 키
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 세션 만료 시간 설정 (24시간)
  }
}));
const { Sequelize, DataTypes} = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Diary = sequelize.define('Diary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "mycont",
  }
});

const TODO = sequelize.define('TODO', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "mycont",
  }
});

(async () => {
  try {
    await sequelize.sync({ force: false }); // 테이블이 이미 존재하는 경우 삭제 후 재생성
    console.log('테이블이 성공적으로 생성되었습니다.');
  } catch (error) {
    console.error('테이블 생성 실패:', error);
  } finally {
    
  }
})();


// req.body 오는 값을 읽기 위해 적용
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// set the view engine to ejs
// 눈에 보이는 엔진은 뭘 사용할거냐, "ejs라는 파일"을 응답에 실어 보내겠다!
app.set('view engine', 'ejs');
app.use(express.static("views"));
// use res.render to load up an ejs view file

// index page
// 저번 시간에 배운 res.send (or res.json)가 res.render로!

app.get('/', function(req, res) { // get방식의 요청은 이곳으로 와라!!, 라우팅에 따라 다른 곳으로!!, 콜백함수: 다음에 실행할 함수!!
  const loggedIn = req.session.user ? req.session.user.id : null;
  console.log('현재 로그인 한 사용자 ID:', loggedIn);
  res.render('index', { loggedIn: loggedIn });
  console.log('index.ejs');
});

// 서버에서 변수를 넘겨줄 수 있다!!
app.get('/login', function(req, res) {
    res.render('login');
});
app.get('/signup', function(req, res) {
    res.render('signup');
});
app.post('/signup/', async (req, res) => {
  
  const username = req.body.username;
  const password = req.body.password;
  console.log('사용자 이름:', username);
  console.log('비밀번호:', password);
  try {
    // 사용자 조회
    const user = await User.findByPk(username);

    if (user) {
      console.log('이미 존재하는 아이디입니다.');
      res.send('<script>alert("이미 존재하는 아이디입니다."); window.location.href = "/signup";</script>');
      
      return;
    }
    else {
      createUser(username, username, password);
      res.send('<script>alert("회원가입 완료! 로그인 해주세요."); window.location.href = "/login"; </script>');
        }
  
  } catch (err) {
    console.error('회원가입 오류:', err);
  }
});
app.post('/login/', async (req, res) => {
  const idInput = req.body.username;
  const pwInput = req.body.password;

  console.log('id는 ', idInput);
  console.log('pw는 ', pwInput);
  try {
    // 사용자 조회
    const user = await User.findByPk(idInput);

    if (!user) {
      // 사용자가 존재하지 않을 경우
      return res.send('<script>alert("사용자가 존재하지 않습니다."); window.location.href = "/login"; </script>');
    }

    if (user.password !== pwInput) {
      // 비밀번호가 일치하지 않을 경우
      console.log('사용자 정보:', user);
      console.log('비밀번호가 일치하지 않습니다.');
      return res.send('<script>alert("비밀번호가 일치하지 않습니다."); window.location.href = "/login"; </script>');
    }

    // 로그인 성공
    // 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      username: user.username,
    };

    console.log('로그인 성공!');

    console.log("req.session.user : "+req.session.user.id); 
    return res.redirect('/'); // '/' 경로로 리디렉션

  } catch (err) {
    console.error('로그인 오류:', err);
  }
  
});

app.get('/logout', (req, res) => {
  // 세션에서 사용자 정보 제거
  req.session.destroy((err) => {
    if (err) {
      console.error('세션 제거 오류:', err);
      return res.status(500).send('세션 제거 오류');
    }

    // 로그아웃 성공
    console.log('로그아웃 성공!');
    return res.send('<script>alert("로그아웃 되었습니다."); window.location.href = "/"; </script>');
  });
});

app.get('/diary', async (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  console.log('현재 로그인 한 사용자 ID:', loggedIn);
  const diaries = await Diary.findAll({ where: { username:loggedIn } });
  if(!loggedIn) {
    res.send('<script>alert("로그인 후 사용해주세요!"); window.location.href = "/"; </script>');
  }
  res.render('diary', {loggedIn : loggedIn, diaries:diaries});

});
app.get('/viewdiary', async (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  console.log('현재 로그인 한 사용자 ID:', loggedIn);
  const diary = await Diary.findByPk(req.query.variable);
  console.log(diary.id);

  
  if(!loggedIn) {
    res.send('<script>alert("로그인 후 사용해주세요!"); window.location.href = "/"; </script>');
  }
  res.render('viewdiary', {loggedIn : loggedIn, diary:diary});

});
app.get('/calendar', (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  console.log('현재 로그인 한 사용자 ID:', loggedIn);
  if(!loggedIn) {
    res.send('<script>alert("로그인 후 사용해주세요!"); window.location.href = "/"; </script>');
  }
  res.render('calendar', {loggedIn : loggedIn});

});
app.get('/write', (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  console.log('현재 로그인 한 사용자 ID:', loggedIn);
  if(!loggedIn) {
    res.send('<script>alert("로그인 후 사용해주세요!"); window.location.href = "/"; </script>');
  }
  res.render('write', {loggedIn : loggedIn});

});
app.post('/write/', async (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  const title = req.body.title;
  const content = req.body.contents;

  console.log('일기 작성자:', loggedIn);
  console.log('제목:', title);
  console.log('내용:', content);

  try {
      createDiary(loggedIn, title, content);
      res.send('<script>alert("일기를 작성하였습니다."); window.location.href = "/diary"; </script>');
  } catch (err) {
    console.error('회원가입 오류:', err);
  }
});
app.get('/todolist', async (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  const todos = await TODO.findAll({ where: { username:loggedIn } });
  console.log('현재 로그인 한 사용자 ID:', loggedIn);
  if(!loggedIn) {
    res.send('<script>alert("로그인 후 사용해주세요!"); window.location.href = "/"; </script>');
  }
  res.render('todolist', {loggedIn : loggedIn, todos:todos});

});
app.post('/todolist/', async (req, res) => {
  const loggedIn = req.session.user ? req.session.user.id : null;
  const todo = req.body.todo;

  console.log('투두 작성자:', loggedIn);
  console.log('내용:', todo);

  try {
      createTodo(loggedIn, todo);
      res.send('<script>alert("투두 추가 완료."); window.location.href = "/todolist"; </script>');
  } catch (err) {
    console.error('투두 추가 오류:', err);
  }
});
app.listen(5000);
console.log('Server is listening on port 5000');

// CRUD
const createUser = async (id, username, password) => {
  try {
    await sequelize.sync(); // 테이블이 없는 경우 자동으로 생성
    const user = await User.create({ id, username, password });
    console.log('유저 생성 성공:', user.toJSON());
  } catch (error) {
    console.error('유저 생성 실패:', error);
  }
};
const createDiary = async (username, title, content) => {
  try {
    await sequelize.sync(); // 테이블이 없는 경우 자동으로 생성
    console.log(username, title, content);
    const diary = await Diary.create({ username, title, content});
    console.log('일기 생성 성공:', diary.toJSON());
  } catch (error) {
    console.error('일기 생성 실패:', error);
  }
};
const createTodo = async (username,content) => {
  try {
    await sequelize.sync(); // 테이블이 없는 경우 자동으로 생성
    console.log(username, content);
    const todo = await TODO.create({ username, content});
    console.log('투두 생성 성공:', todo.toJSON());
  } catch (error) {
    console.error('투두 생성 실패:', error);
  }
};
// 사용자 조회
const getUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (user) {
      console.log('유저 조회 결과:', user.toJSON());
      return user;
    } else {
      console.log('유저를 찾을 수 없습니다.');
      return false;
    }
  } catch (error) {
    console.error('유저 조회 실패:', error);
  }
};
// 사용자 업데이트
const updateUser = async (id, newData) => {
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.update(newData);
      console.log('유저 업데이트 성공:', user.toJSON());
    } else {
      console.log('유저를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('유저 업데이트 실패:', error);
  }
};

// 사용자 삭제
const deleteUser = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      console.log('유저 삭제 성공');
    } else {
      console.log('유저를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('유저 삭제 실패:', error);
  }
};
