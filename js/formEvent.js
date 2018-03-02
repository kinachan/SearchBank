
const formHandle = async (ev) => {
  const load = document.getElementById('load-sp');
  load.innerHTML = '読み込み中';
  await commonHandle();
  load.innerHTML = '';
  return false;
}
