(window.webpackJsonp = window.webpackJsonp || []).push([[1], [, function (n, t, e) {
            "use strict";
            var r = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
            t.validate = function (n) { if (!n)
                return !1; if (n.length > 254)
                return !1; if (!r.test(n))
                return !1; var t = n.split("@"); return !(t[0].length > 64) && !t[1].split(".").some((function (n) { return n.length > 63; })); };
        }]]);
