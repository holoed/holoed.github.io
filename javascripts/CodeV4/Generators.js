"use strict";

function range (start) {
  return function (end) {
    return function* () {
      var i = start
      while (i <= end) {
        yield i
        i += 1
      }
    }
  }
}

function drop (n) {
  return function (xs) {
    return function* () {
      var iterator = xs()
      var next = iterator.next()
      var i = 1

      while (!next.done) {
        if (i > n) yield next.value
        i++
        next = iterator.next()
      }
    }
  }
}

function head (xs) {
  return xs().next().value
}

function tail (xs) {
  return drop(1)(xs)
}

function toArray (xs) {
  return [ ...xs() ]
}

function cons(x) {
    return function (list) {
      return function*() {
  	     yield x, yield* list();
    }
  }
}

function empty() {
  return function*() {}
}

function isEmpty(xs) {
  return xs().next().done
}
