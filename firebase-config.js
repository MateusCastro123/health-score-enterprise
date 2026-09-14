// Firebase Configuration
// Projeto: steptalk-28bbc
// Substitua com suas credenciais reais do Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789", // Substitua com sua API Key
  authDomain: "steptalk-28bbc.firebaseapp.com",
  databaseURL: "https://steptalk-28bbc-default-rtdb.firebaseio.com",
  projectId: "steptalk-28bbc",
  storageBucket: "steptalk-28bbc.appspot.com",
  messagingSenderId: "123456789", // Substitua
  appId: "1:123456789:web:abc123def456" // Substitua
};

// IMPORTANTE: Para obter suas credenciais reais:
// 1. Acesse: https://console.firebase.google.com/
// 2. Selecione o projeto: steptalk-28bbc
// 3. Vá para: Project Settings (⚙️)
// 4. Na aba "Your apps", localize sua app web
// 5. Copie as credenciais e substitua acima

// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(app);
const database = firebase.database(app);

console.log('✅ Firebase inicializado com sucesso!');
console.log('Projeto:', firebaseConfig.projectId);
