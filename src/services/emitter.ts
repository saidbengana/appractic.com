import mitt from 'mitt'
import { Events } from './events'

const emitter = mitt<Events>()

export default emitter
