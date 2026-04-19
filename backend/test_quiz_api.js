const http = require('http');
const tests = [
  '/api/quiz?topic=mongodb&difficulty=easy&amount=5',
  '/api/quiz?topic=express&difficulty=medium&amount=5',
  '/api/quiz?topic=node&difficulty=hard&amount=5',
  '/api/quiz?topic=js&difficulty=all&amount=5',
  '/api/quiz?topic=mern&difficulty=medium&amount=10',
];
let done = 0;
tests.forEach(path => {
  http.get('http://localhost:5000' + path, (r) => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
      const p = JSON.parse(d);
      const status = p.success ? 'OK' : 'FAIL';
      console.log('[' + status + '] ' + path + ' - ' + p.count + ' questions');
      if (++done === tests.length) console.log('All tests completed.');
    });
  }).on('error', e => console.error('Error on', path, e.message));
});
