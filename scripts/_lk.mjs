import { getPayload } from 'payload'; import config from '../src/payload.config.ts'
const p = await getPayload({ config })
const s = await p.findGlobal({slug:'site-settings', depth:1})
const ls=(s.leaders||[]).map(l=>({name:l.name,photo:(l.photo&&typeof l.photo==='object')?l.photo.filename:l.photo}))
console.log('LEADERS:'+JSON.stringify(ls))
