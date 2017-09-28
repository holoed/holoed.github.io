"use strict";
;; var {cons, isEmpty, head, tail, empty} = require('./Externals.js'); var compose = function (f) {  return function (g) {  return function (x) {  return (f ((g (x)))) } } }; var foldLeft = function (f) {  return function (v) {  return function (xs) {  return function() { if ((isEmpty (xs))) { return v } else { return (((foldLeft (f)) (((f (v)) ((head (xs)))))) ((tail (xs)))) } }() } } }; var id = function (x) {  return x }; var foldRight = function (f) {  return function (v) {  return function (xs) {  return ((((foldLeft (function (g) {  return function (b) {  return function (x) {  return (g (((f (b)) (x)))) } } })) (id)) (xs)) (v)) } } }; var append = function (xs) {  return function (ys) {  return function() { if ((isEmpty (xs))) { return ys } else { return ((cons ((head (xs)))) (((append ((tail (xs)))) (ys)))) } }() } }; var concat = function (xss) {  return function() { if ((isEmpty (xss))) { return empty } else { return ((append ((head (xss)))) ((concat ((tail (xss)))))) } }() }; var range = function (startIndex) {  return function (endIndex) { var range2 = function (acc) {  return function (endIndex) {  return function() { if ((startIndex > (endIndex))) { return acc } else { return ((range2 (((cons (endIndex)) (acc)))) ((endIndex - (1)))) } }() } }; return ((range2 (empty)) (endIndex)) } }; var drop = function (n) {  return function (xs) {  return function() { if (((n == (0)) || ((isEmpty (xs))))) { return xs } else { return ((drop ((n - (1)))) ((tail (xs)))) } }() } }; var reverse = ((foldLeft (function (acc) {  return function (x) {  return ((cons (x)) (acc)) } })) (empty)); var take = function (n) {  return function (xs) { var take2 = function (n) {  return function (acc) {  return function (xs) {  return function() { if (((n == (0)) || ((isEmpty (xs))))) { return acc } else { return (((take2 ((n - (1)))) (((cons ((head (xs)))) (acc)))) ((tail (xs)))) } }() } } }; return (reverse ((((take2 (n)) (empty)) (xs)))) } }; var fmap = function (f) {  return function (xs) {  return (((foldRight (function (x) {  return function (acc) {  return ((cons ((f (x)))) (acc)) } })) (empty)) (xs)) } }; var flatMap = function (f) {  return ((compose (concat)) ((fmap (f)))) }; exports.compose = compose; exports.foldLeft = foldLeft; exports.id = id; exports.foldRight = foldRight; exports.append = append; exports.concat = concat; exports.range = range; exports.drop = drop; exports.reverse = reverse; exports.take = take; exports.fmap = fmap; exports.flatMap = flatMap;
