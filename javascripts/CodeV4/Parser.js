"use strict";
;; var {cons, isEmpty, head, tail, isSpace, isLower, isUpper, empty, mkTuple2, fst, snd, stringToCharList, charListToString, stringToInt, size, notElem, evar, elitS, elit, elitVoid, eimport, eprog, eapp, elet, eIfThenElse, elam} = require('./Externals.js'); var {compose, foldLeft, id, foldRight, append, concat, range, fmap, flatMap} = require('./Base.js'); var isDigit = function (ch) {  return ((((((((((ch == ("0")) || ((ch == ("1")))) || ((ch == ("2")))) || ((ch == ("3")))) || ((ch == ("4")))) || ((ch == ("5")))) || ((ch == ("6")))) || ((ch == ("7")))) || ((ch == ("8")))) || ((ch == ("9")))) }; var bind = function (m) {  return function (f) {  return function (cs) { var xs = (m (cs)); return function() { if ((isEmpty (xs))) { return empty } else { var n = (head (xs)); return ((f ((fst (n)))) ((snd (n)))) } }() } } }; var unit = function (x) {  return function (cs) {  return ((cons (((mkTuple2 (x)) (cs)))) (empty)) } }; var fail = function (cs) {  return empty }; var item = function (cs) {  return function() { if ((isEmpty (cs))) { return empty } else { var ch = (head (cs)); return ((cons (((mkTuple2 (ch)) ((tail (cs)))))) (empty)) } }() }; var sep = function (p) {  return function (q) {  return ((bind (p)) (function (x) {  return ((bind (q)) (function (y) {  return (unit (((mkTuple2 (x)) (y)))) })) })) } }; var sat = function (p) {  return ((bind (item)) (function (ch) {  return function() { if ((p (ch))) { return (unit (ch)) } else { return fail } }() })) }; var chr = function (x) {  return (sat (function (ch) {  return (ch == (x)) })) }; var choice = function (p) {  return function (q) {  return function (cs) { var xs = (p (cs)); return function() { if ((isEmpty (xs))) { return (q (cs)) } else { return xs } }() } } }; var many = function (p) {  return ((choice (((bind (p)) (function (x) {  return ((bind ((many (p)))) (function (xs) {  return (unit (((cons (x)) (xs)))) })) })))) ((unit (empty)))) }; var digit = (sat (isDigit)); var lower = (sat (isLower)); var upper = (sat (isUpper)); var letter = ((choice (lower)) (upper)); var alphanum = ((choice (letter)) (digit)); var word = (many (letter)); var space = ((bind ((sat (isSpace)))) (function (x) {  return (unit ("()")) })); var spaces = ((bind ((many (space)))) (function (x) {  return (unit ("()")) })); var str = function (txt) { var xs = (stringToCharList (txt)); var str2 = function (xs) {  return function() { if ((isEmpty (xs))) { return (unit (empty)) } else { var x = (head (xs)); var xs2 = (tail (xs)); return ((bind ((chr (x)))) (function (a) {  return ((bind ((str2 (xs2)))) (function (b) {  return (unit (((cons (x)) (xs2)))) })) })) } }() }; return ((bind ((str2 (xs)))) (function (ys) {  return (unit ((charListToString (ys)))) })) }; var junk = ((bind ((many (space)))) (function (a) {  return (unit ("()")) })); var token = function (p) {  return ((bind (p)) (function (x) {  return ((bind (junk)) (function (a) {  return (unit (x)) })) })) }; var parse = function (p) {  return ((bind (junk)) (function (a) {  return p })) }; var symbol = function (txt) {  return (token ((str (txt)))) }; var ident = ((bind (lower)) (function (x) {  return ((bind ((many (alphanum)))) (function (xs) {  return (unit ((charListToString (((cons (x)) (xs)))))) })) })); var many1 = function (p) {  return ((bind (p)) (function (x) {  return ((bind ((many (p)))) (function (xs) {  return (unit (((cons (x)) (xs)))) })) })) }; var nat = ((bind ((many1 (digit)))) (function (xs) {  return (unit ((stringToInt ((charListToString (xs)))))) })); var integer = function () { var op = ((choice (((bind ((chr ("-")))) (function (x) {  return (unit (neg)) })))) ((unit (function (x) {  return x })))); return ((bind (op)) (function (f) {  return ((bind (nat)) (function (n) {  return (unit ((f (n)))) })) })) }();; var makeFloat = function (m) {  return function (n) {  return function() { if ((m > (0))) { return (m + ((n * ((1 / ((size (n)))))))) } else { return (m - ((n * ((1 / ((size (n)))))))) } }() } }; var float = ((bind (integer)) (function (m) {  return ((bind ((symbol (".")))) (function (x) {  return ((bind (nat)) (function (n) {  return (unit (((makeFloat (m)) (n)))) })) })) })); var identifier = function (ks) {  return ((bind ((token (ident)))) (function (x) {  return function() { if (((notElem (x)) (ks))) { return (unit (x)) } else { return fail } }() })) }; var sepBy1 = function (p) {  return function (sep) {  return ((bind (p)) (function (x) {  return ((bind ((many (((bind (sep)) (function (i1) {  return p })))))) (function (xs) {  return (unit (((cons (x)) (xs)))) })) })) } }; var sepBy = function (p) {  return function (sep) {  return ((choice (((sepBy1 (p)) (sep)))) ((unit (empty)))) } }; var variable = (identifier (((cons ("let")) (((cons ("in")) (((cons ("if")) (((cons ("then")) (((cons ("else")) (empty)))))))))))); var vaR = ((bind (variable)) (function (s) {  return (unit ((evar (s)))) })); var noneOf = function (cs) {  return (sat (function (c) {  return ((notElem (c)) (cs)) })) }; var escapedQuotes = ((bind ((chr ("\\")))) (function (x) {  return ((bind ((chr ("\"")))) (function (y) {  return (unit ("\"")) })) })); var escapedBackslash = ((bind ((chr ("\\")))) (function (x) {  return ((bind ((chr ("\\")))) (function (y) {  return (unit ("\\")) })) })); var escaped = ((choice (escapedQuotes)) (escapedBackslash)); var chars = ((choice (escaped)) ((noneOf ((stringToCharList ("\\\"")))))); var quotedString = ((bind ((chr ("\"")))) (function (x) {  return ((bind ((many (chars)))) (function (xs) {  return ((bind ((chr ("\"")))) (function (z) {  return (unit ((charListToString (xs)))) })) })) })); var lit = ((choice (((choice (((choice (((bind ((token (float)))) (function (n) {  return (unit ((elit (n)))) })))) (((bind ((token (integer)))) (function (n) {  return (unit ((elit (n)))) })))))) (((bind ((token (quotedString)))) (function (s) {  return (unit ((elitS (s)))) })))))) (((bind ((symbol ("()")))) (function (x) {  return (unit (elitVoid)) })))); var chainl1 = function (p) {  return function (op) { var rest = function (x) {  return ((choice (((bind (op)) (function (f) {  return ((bind (p)) (function (y) {  return (rest (((f (x)) (y)))) })) })))) ((unit (x)))) }; return ((bind (p)) (rest)) } }; var chainr1 = function (p) {  return function (op) { var rest = function (x) {  return ((choice (((bind (op)) (function (f) {  return ((bind (((chainr1 (p)) (op)))) (function (y) {  return (unit (((f (x)) (y)))) })) })))) ((unit (x)))) }; return ((bind (p)) (rest)) } }; var infixOp = function (s) {  return function (x) {  return function (y) {  return ((eapp (((eapp ((evar (s)))) (x)))) (y)) } } }; var addOp = ((choice (((bind ((symbol ("+")))) (function (x) {  return (unit ((infixOp ("+")))) })))) (((bind ((symbol ("-")))) (function (x) {  return (unit ((infixOp ("-")))) })))); var mulOp = ((choice (((bind ((symbol ("*")))) (function (x) {  return (unit ((infixOp ("*")))) })))) (((bind ((symbol ("/")))) (function (x) {  return (unit ((infixOp ("/")))) })))); var cmpOp = ((choice (((choice (((choice (((choice (((bind ((symbol (">")))) (function (x) {  return (unit ((infixOp (">")))) })))) (((bind ((symbol ("<")))) (function (x) {  return (unit ((infixOp ("<")))) })))))) (((bind ((symbol ("==")))) (function (x) {  return (unit ((infixOp ("==")))) })))))) (((bind ((symbol ("||")))) (function (x) {  return (unit ((infixOp ("||")))) })))))) (((bind ((symbol ("&&")))) (function (x) {  return (unit ((infixOp ("&&")))) })))); var expr = function () { var parens = ((bind ((symbol ("(")))) (function (i1) {  return ((bind (expr)) (function (e) {  return ((bind ((symbol (")")))) (function (i2) {  return (unit (e)) })) })) })); var lam = ((bind ((symbol ("\\")))) (function (i1) {  return ((bind (variable)) (function (s) {  return ((bind ((symbol ("->")))) (function (i2) {  return ((bind (expr)) (function (e) {  return (unit (((elam (s)) (e)))) })) })) })) })); var local = ((bind ((symbol ("let")))) (function (i1) {  return ((bind (variable)) (function (v) {  return ((bind ((symbol ("=")))) (function (i2) {  return ((bind (expr)) (function (e1) {  return ((bind ((symbol ("in")))) (function (i3) {  return ((bind (expr)) (function (e2) {  return (unit ((((elet (v)) (e1)) (e2)))) })) })) })) })) })) })); var ifThenElse = ((bind ((symbol ("if")))) (function (i1) {  return ((bind (expr)) (function (p) {  return ((bind ((symbol ("then")))) (function (i2) {  return ((bind (expr)) (function (e1) {  return ((bind ((symbol ("else")))) (function (i3) {  return ((bind (expr)) (function (e2) {  return (unit ((((eIfThenElse (p)) (e1)) (e2)))) })) })) })) })) })) })); var atom = ((choice (((choice (((choice (((choice (((choice (ifThenElse)) (lam)))) (local)))) (vaR)))) (lit)))) (parens)); return (((foldLeft (chainl1)) (atom)) (((cons (mulOp)) (((cons (addOp)) (((cons (cmpOp)) (((cons ((unit (eapp)))) (empty)))))))))) }();; var packageNameP = (token (((bind (upper)) (function (x) {  return ((bind ((many (alphanum)))) (function (xs) {  return (unit ((charListToString (((cons (x)) (xs)))))) })) })))); var importP = ((bind ((symbol ("import")))) (function (i1) {  return ((bind (packageNameP)) (function (name) {  return ((bind ((symbol ("(")))) (function (i2) {  return ((bind (((sepBy (variable)) ((symbol (",")))))) (function (xs) {  return ((bind ((symbol (")")))) (function (i3) {  return (unit (((eimport (name)) (xs)))) })) })) })) })) })); var progP = ((bind ((many (importP)))) (function (is) {  return ((bind (expr)) (function (e) {  return (unit (((eprog (is)) (e)))) })) })); exports.isDigit = isDigit; exports.bind = bind; exports.unit = unit; exports.fail = fail; exports.item = item; exports.sep = sep; exports.sat = sat; exports.chr = chr; exports.choice = choice; exports.many = many; exports.digit = digit; exports.lower = lower; exports.upper = upper; exports.letter = letter; exports.alphanum = alphanum; exports.word = word; exports.space = space; exports.spaces = spaces; exports.str = str; exports.junk = junk; exports.token = token; exports.parse = parse; exports.symbol = symbol; exports.ident = ident; exports.many1 = many1; exports.nat = nat; exports.integer = integer; exports.makeFloat = makeFloat; exports.float = float; exports.identifier = identifier; exports.sepBy1 = sepBy1; exports.sepBy = sepBy; exports.variable = variable; exports.vaR = vaR; exports.noneOf = noneOf; exports.escapedQuotes = escapedQuotes; exports.escapedBackslash = escapedBackslash; exports.escaped = escaped; exports.chars = chars; exports.quotedString = quotedString; exports.lit = lit; exports.chainl1 = chainl1; exports.chainr1 = chainr1; exports.infixOp = infixOp; exports.addOp = addOp; exports.mulOp = mulOp; exports.cmpOp = cmpOp; exports.expr = expr; exports.packageNameP = packageNameP; exports.importP = importP; exports.progP = progP;
