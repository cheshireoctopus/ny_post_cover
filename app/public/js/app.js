document.querySelector('.get-some').onclick = getSome

async function getSome() {
  const res = await fetch('/cover')
  const json = await res.json()
  const img = document.createElement('img')

  img.setAttribute('src', json.url)
  document.querySelector('.cover').appendChild(img)
}
