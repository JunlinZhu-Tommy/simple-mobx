import EventEmitter from '../utils/event-emitter';

const em = new EventEmitter();
let currentFn;
let obId = 1;

/**
 * 
 * 
 autorun(() => {
  if (store.a === 2) {
    console.log(store.b.c);
  }
  });
 */
const autorun = (fn) => {
  console.log('AUTORUN ')
  const warpFn = () => {
    currentFn = warpFn;

    // currentFn when call get
    fn();
    currentFn = null;
  }
  warpFn();
};

const observable = (obj) => {
  // 用 Symbol 当 key；这样就不会被枚举到，仅用于值的存储
  const data = Symbol('data');
  obj[data] = JSON.parse(JSON.stringify(obj));

  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object') {
      observable(obj[key]);
    } else {
      // 每个 key 都生成唯一的 channel ID
      const id = String(obId++);
      Object.defineProperty(obj, key, {
        get: function () {
          console.log('register get callback event', key, currentFn)
          if (currentFn) {
            em.on(id, currentFn);
          }
          return obj[data][key];
        },
        set: function (v) {
          // 值不变时不触发
          if (obj[data][key] !== v) {
            console.log('SET KEY and EMIT', key, v)
            obj[data][key] = v;
            em.emit(id);
          }
        }
      });
    }
  });
  return obj;
};

export {
  autorun,
  observable
}