
/**
 * 一个简单的浅拷贝
 * @param {Object} sourceObj 要复制的对象
 * @returns 返回浅拷贝的对象
 */
function shallowCopy(sourceObj) {
  var obj = {}

  if (typeof sourceObj !== 'object') {
    return sourceObj
  }
  for (var key in sourceObj) {
    if (Object.prototype.hasOwnProperty.call(sourceObj, key)) {
      obj[key] = sourceObj[key]
    }
  }
  return obj
}

/**
 * 深拷贝0（JSON.stringify()一把梭）
 * @param0 sourceObj 要复制的对象
 * @returns {Object} 返回深拷贝的对象
 */
function deepCopy0(sourceObj) {
  try {
    return JSON.parse(JSON.stringify(sourceObj))
  } catch (error) {
    console.log('JSON.stringify报错：', error)
  }
}

var obj0 = {
  name: 'obj0',
  info: {
    sex: 'male',
    age: 22
  },
  undefined: undefined,
  func: function () { console.log('I am a simple function') },
  exp: new RegExp('\\w+'),
  createTime: new Date(),
  [Symbol('foo')]: 'symbol',
}
// 循环引用
// obj0.circularReference = obj0

// 深拷贝，完全独立的两份数据，修改原对象引用类型的值，对拷贝出来的对象没影响
var copyObj0 = deepCopy0(obj0)
console.log('copyObj0--origin', obj0)
obj0.info.age = 100
console.log('copyObj0--copy', copyObj0)

try {
  copyObj0.func()
} catch (error) {
  console.log('这里会报错：', error)
}

// deepCopy0方法有以下几个问题:
// 1、会忽略 undefined
// 2、会忽略 symbol
// 3、会忽略函数
// 4、不能正确处理new Date()，会调用Date的toJSON方法转成字符串？
// 5、不能处理正则（变成空对象）
// 6、不能解决循环引用的对象（直接报错）


/**
 * 深拷贝1
 * @param0 sourceObj 要复制的对象
 * @returns {Object} 返回深拷贝的对象
 */
function deepCopy1(sourceObj) {
  var obj = {}

  if (typeof sourceObj !== 'object') {
    return sourceObj
  }

  Object.keys(sourceObj).forEach(key => {
    // 引用类型，递归
    if (typeof sourceObj[key] === 'object') {
      obj[key] = deepCopy1(sourceObj[key])
    } else {
      obj[key] = sourceObj[key]
    }
  })
  return obj
}

var obj1 = {
  name: 'obj1',
  info: {
    sex: 'male',
    age: 18
  },
  undefined: undefined,
  func: function () { console.log('I am a simple function') },
  exp: new RegExp('\\w+'),
  createTime: new Date(),
  [Symbol('foo')]: 'symbol'
}
// 循环引用
// obj1.circularReference = obj1

// 深拷贝，完全独立的两份数据，修改原对象引用类型的值，对拷贝出来的对象没影响
var copyObj1 = deepCopy1(obj1)
console.log('copyObj1-origin', obj1)
obj1.info.age = 16
console.log('copyObj1-copy', copyObj1)
copyObj1.func()

// 浅拷贝，修改原对象的引用类型的值，拷贝出来的对象也一同被修改
var shObj = shallowCopy(obj1)
obj1.info.age = 16
console.log('shObj', shObj)

// deepCopy1方法有以下几个问题:
// 1、会忽略 symbol
// 2、不能正确处理new Date()（变成空对象）
// 3、不能处理正则（变成空对象）
// 4、不能解决循环引用的对象（会导致堆栈溢出）

/**
 * 深拷贝2（解决时间对象、正则表达式拷贝问题）
 * @param0 sourceObj 要复制的对象
 * @returns {Object} 返回深拷贝的对象
 */
function deepCopy2(sourceObj) {
  var obj = {}

  if (typeof sourceObj !== 'object') {
    return sourceObj
  }

  Object.keys(sourceObj).forEach(key => {
    // 引用类型，递归
    if (typeof sourceObj[key] === 'object') {
      if (sourceObj[key].constructor.name === 'Date') {
        obj[key] = sourceObj[key]
      } else if (sourceObj[key].constructor.name === 'RegExp') {
        var regexp = sourceObj[key]
        var reFlags = /\w*$/ // 提取正则的标识位
        // var result = new regexp.constructor(regexp.source, reFlags.exec(regexp)) // lodash的做法
        var result = new RegExp(regexp.source, reFlags.exec(regexp)) // 我的做法
        result.lastIndex = regexp.lastIndex // 上一次匹配执行到的位置，默认为0
        obj[key] = result
      } else {
        obj[key] = deepCopy2(sourceObj[key])
      }
    } else {
      obj[key] = sourceObj[key]
    }
  })
  return obj
}

var obj2 = {
  name: 'obj2',
  info: {
    sex: 'male',
    age: 18
  },
  undefined: undefined,
  func: function () { console.log('I am a simple function') },
  exp: new RegExp('\[0-9\]'),
  createTime: new Date(),
  [Symbol('foo')]: 'symbol'
}
// 循环引用
// obj2.circularReference = obj2

var copyObj2 = deepCopy2(obj2)
console.log('copyObj2-origin', obj2)
console.log('copyObj2-copy', copyObj2)

// deepCopy2方法有以下几个问题:
// 1、会忽略 symbol
// 2、不能解决循环引用的对象（会导致堆栈溢出）


/**
 * 深拷贝3（解决循环引用问题）
 * @param0 sourceObj 要复制的对象
 * @param1 hash 哈希表（非必填）
 * @returns {Object} 返回深拷贝的对象
 */
function deepCopy3(sourceObj, hash) {
  if (typeof sourceObj !== 'object') {
    return sourceObj
  }

  var obj = {}
  var hash = hash || new WeakMap() // 使用哈希表存储遍历过的对象

  // 查找hash表中是否存在相同的值
  if (hash.has(sourceObj)) {
    return hash.get(sourceObj)
  }

  // 缓存当前的数据对象
  hash.set(sourceObj, obj)

  Object.keys(sourceObj).forEach(key => {
    // 引用类型，递归
    if (typeof sourceObj[key] === 'object') {
      if (sourceObj[key].constructor.name === 'Date') {
        obj[key] = sourceObj[key]
      } else if (sourceObj[key].constructor.name === 'RegExp') {
        var regexp = sourceObj[key]
        var reFlags = /\w*$/ // 提取正则的标识位
        var result = new RegExp(regexp.source, reFlags.exec(regexp)) // 我的做法
        // var result = new regexp.constructor(regexp.source, reFlags.exec(regexp)) // lodash的做法

        result.lastIndex = regexp.lastIndex // 上一次匹配执行到的位置，默认为0
        obj[key] = result
      } else {
        obj[key] = deepCopy3(sourceObj[key], hash) // 新增代码，传入hash表
      }
    } else {
      obj[key] = sourceObj[key]
    }
  })
  return obj
}

var obj3 = {
  name: 'obj3',
  info: {
    sex: 'male',
    age: 18
  },
  undefined: undefined,
  func: function () { console.log('I am a simple function') },
  exp: new RegExp('\[0-9\]'),
  createTime: new Date(),
  [Symbol('foo')]: 'symbol'
}
// 循环引用
obj3.circularReference = obj3

var copyObj3 = deepCopy3(obj3)
console.log('copyObj3-origin', obj3)
console.log('copyObj3-copy', copyObj3)

// deepCopy3方法有以下几个问题:
// 1、会忽略 symbol


/**
 * 深拷贝4（采用递归可能爆栈）
 * @param0 sourceObj 要复制的对象
 * @param1 hash 哈希表（非必填）
 * @returns {Object} 返回深拷贝的对象
 */
function deepCopy4(sourceObj, hash) {
  if (typeof sourceObj !== 'object') {
    return sourceObj
  }

  var obj = Array.isArray(sourceObj) ? [] : {}
  var hash = hash || new WeakMap() // 使用哈希表存储遍历过的对象

  // 查找hash表中是否存在相同的值
  if (hash.has(sourceObj)) {
    return hash.get(sourceObj)
  }

  // 缓存当前的数据对象
  hash.set(sourceObj, obj)

  // 新增代码，遍历symbols
  var objSymbols = Object.getOwnPropertySymbols(sourceObj)// 获取所有Symbol的key
  if (objSymbols.length) {
    objSymbols.forEach(symKey => {
      if (typeof objSymbols[symKey] === 'object') {
        obj[symKey] = deepCopy4(sourceObj[symKey], hash)
      } else {
        obj[symKey] = sourceObj[symKey]
      }
    })
  }

  for (var key in sourceObj) {
    if (sourceObj.hasOwnProperty(key)) {
      // 引用类型，递归
      if (typeof sourceObj[key] === 'object') {
        if (sourceObj[key].constructor.name === 'Date') {
          obj[key] = sourceObj[key]
        } else if (sourceObj[key].constructor.name === 'RegExp') {
          var regexp = sourceObj[key]
          var reFlags = /\w*$/ // 提取正则的标识位
          var result = new RegExp(regexp.source, reFlags.exec(regexp)) // 我的做法
          // var result = new regexp.constructor(regexp.source, reFlags.exec(regexp)) // lodash的做法

          result.lastIndex = regexp.lastIndex // 上一次匹配执行到的位置，默认为0
          obj[key] = result
        } else {
          obj[key] = deepCopy4(sourceObj[key], hash) // 新增代码，传入hash表
        }
      } else {
        obj[key] = sourceObj[key]
      }
    }
  }
  return obj
}

var obj4 = {
  name: 'obj4',
  info: {
    sex: 'male',
    age: 18
  },
  undefined: undefined,
  func: function () { console.log('I am a simple function') },
  exp: new RegExp('\[0-9\]'),
  createTime: new Date(),
  [Symbol('foo')]: new Date(),
  [Symbol('bar')]: 'symbol bar',
  [Symbol('bar')]: new RegExp('\[a-z\]'),
  arr: [1, 2, 3],
  fetchData: ["2021-08-12", "2021-08-12"]
}
var arr4 = [
  obj4,
  111,
  [222, 888],
  [{ fetchData: ["2021-08-12", "2021-08-12"] }]
]
// 循环引用
obj4.circularReference = obj4

var copyObj4 = deepCopy4(obj4)
var copyArr4 = deepCopy4(arr4)
console.log('copyObj4-copy', copyObj4)
obj4.info.age = 100
obj4.arr[2] = 666
console.log('copyObj4-origin', obj4)

console.log('copyArr4-copy', copyArr4)
arr4[3][0].a = 'addd aaa'
arr4[2][1] = 'change to 666'
console.log('copyArr4-origin', arr4)

// deepCopy4方法有以下几个问题:
// 1、没有兼容数组，对对象的判断不够严谨；
// 2、采用递归，没有考虑爆栈问题。

/**
 * 判断输入是否为对象类型（数组也是对象）
 * @param {any} obj 
 * @returns Boolean 返回true或false
 */
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]' || Object.prototype.toString.call(obj) === '[object Array]'
}

/**
 * 正则拷贝
 * @param {RegExp} regexp 
 * @returns 拷贝后的正则
 */
function copyRegExp(regexp) {
  var reFlags = /\w*$/ // 提取正则的标识位
  var result = new RegExp(regexp.source, reFlags.exec(regexp)) // 我的做法
  // var result = new regexp.constructor(regexp.source, reFlags.exec(regexp)) // lodash的做法

  result.lastIndex = regexp.lastIndex // 上一次匹配执行到的位置，默认为0
  return result
}

/**
 * 数组查找
 * @param {原数组} arr 
 * @param {要查找的目标} item 
 * @returns 返回找到的数据，找不到则null
 */
function find(arr, item) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].source === item) {
      return arr[i];
    }
  }

  return null;
}
/**
 * 深拷贝5（改用循环，解决爆栈问题，并优化对象的判断方式）
 * @param0 sourceObj 要复制的对象
 * @param1 hash 哈希表（非必填）
 * @returns {Object} 返回深拷贝的对象
 */
function deepCopy5(sourceObj, hash) {
  // 优化代码，优化引用类型判断
  if (!isObject(sourceObj)) {
    return sourceObj
  }

  // 新增代码，兼容数组类型
  var root = Array.isArray(sourceObj) ? [] : {}
  var uniqueList = [] // 使用数组缓存

  var loopList = [{
    parent: root,
    key: undefined,
    data: sourceObj
  }]

  while (loopList.length) {
    var node = loopList.pop() // 出栈
    var key = node.key
    var data = node.data
    var parent = node.parent

    // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
    let res = parent
    if (typeof key !== 'undefined') {
      res = parent[key] = Array.isArray(data) ? [] : {}
    }
    console.log('uniqueList', uniqueList)
    // debugger
    // 数据已经存在
    let uniqueData = find(uniqueList, data);
    console.log('uniqueData', uniqueData)
    if (uniqueData) {
      parent[key] = uniqueData.target;
      continue; // 中断本次循环，不能用break，否则会无法拷贝其他的对象（{}）类型呢
    }

    // 数据不存在
    // 保存源数据，在拷贝数据中对应的引用
    uniqueList.push({
      source: data,
      target: res
    });

    // 遍历symbols
    var objSymbols = Object.getOwnPropertySymbols(data)// 获取所有Symbol的key

    if (objSymbols.length) {
      objSymbols.forEach(symKey => {
        if (typeof objSymbols[symKey] === 'object') {
          loopList.push({
            parent: res,
            key: key,
            data: res[symKey]
          })
        } else {
          res[symKey] = data[symKey]
        }
      })
    }

    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        let tempObj = data[key]

        if (isObject(tempObj)) {
          if (tempObj.constructor.name === 'Date') {
            loopList.push({
              parent: res,
              key: key,
              data: new Date(tempObj)
            })
          } else if (tempObj.constructor.name === 'RegExp') {
            loopList.push({
              parent: res,
              key: key,
              data: copyRegExp(tempObj)
            })
          } else {
            loopList.push({
              parent: res,
              key: key,
              data: tempObj
            })
          }
        } else {
          res[key] = tempObj
        }
      }
    }
  }

  return root
}

var obj5 = {
  name: 'obj5',
  info: {
    sex: 'male',
    age: 18
  },
  undefined: undefined,
  func: function () { console.log('I am a simple function') },
  exp: new RegExp('\[0-9\]'),
  createTime: new Date(),
  [Symbol('foo')]: new Date(),
  [Symbol('bar')]: 'symbol bar',
  [Symbol('bar')]: new RegExp('\[a-z\]'),
}

// 循环引用
obj5.circularRef = obj5

// 对象拷贝测试
var copyObj5 = deepCopy5(obj5)
console.log('copyObj5-copy', copyObj5)
copyObj5.info.age = 66
copyObj5.createTime = new Date('2021-08-10 18:16:40')
copyObj5.func = () => { console.log('我是被修改后的函数') }

console.log('copyObj5-origin', obj5)
obj5.func()

var arr5 = [
  {
    name: 'obj5',
    info: {
      sex: 'male',
      age: 18
    },
    undefined: undefined,
    func: function () { console.log('I am a simple function') },
    exp: new RegExp('\[0-9\]'),
    createTime: new Date(),
    [Symbol('foo')]: new Date(),
    [Symbol('bar')]: 'symbol bar',
    [Symbol('bar')]: new RegExp('\[a-z\]'),
  },
  111,
  [1, 2]
]

// 数组拷贝测试
var copyArr5 = deepCopy5(arr5)
console.log('copyArr5-copy', copyArr5)
copyArr5[0].info.age = 100
copyArr5[2][0] = 666
console.log('copyArr5-origin', arr5)