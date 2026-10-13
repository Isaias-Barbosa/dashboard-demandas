import mongoose from 'mongoose';

const uri = 'mongodb+srv://isaiasbarbosa111_db_user:lABQJUeTpIWUPH9J@cluster0.z07aiwc.mongodb.net/dashboard-demandas?appName=Cluster0&retryWrites=true&w=majority';

console.log('🔌 Testando conexão...');
console.log('URI:', uri.replace(/:[^:@]+@/, ':****@'));

try {
  await mongoose.connect(uri);
  console.log('✅ CONECTADO AO MONGODB ATLAS!');
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('\n📁 Collections encontradas:');
  collections.forEach(c => console.log('  -', c.name));
  
  // Testar inserção
  const testCollection = db.collection('Demandas');
  const count = await testCollection.countDocuments();
  console.log('\n📊 Documentos em Demandas:', count);
  
  await mongoose.disconnect();
  console.log('\n✅ Teste concluído com sucesso!');
  process.exit(0);
} catch (error) {
  console.log('\n❌ ERRO:', error.message);
  console.log('\n🔍 Possíveis causas:');
  console.log('  1. IP não está na whitelist (mas você disse que 0.0.0.0/0 está configurado)');
  console.log('  2. Usuário/senha incorretos');
  console.log('  3. Cluster pausado (free tier pausa após inatividade)');
  console.log('  4. Problema de rede/firewall');
  process.exit(1);
}