import { getPayload } from 'payload'; import config from '../src/payload.config.ts'
const p = await getPayload({ config })
const s = await p.findGlobal({slug:'site-settings', depth:0})
console.log('LEADERS_COUNT:'+(Array.isArray(s.leaders)?s.leaders.length:0))
