"use strict";
var undefined;
if (typeof window === 'undefined') {
    var chai = require('chai');
    require('dotenv').load();
    var root = process.env.TRAVIS_BUILD_DIR + '/' || '';
    var statistics = require(root + 'js/statistics');
}
var expect = chai.expect;
var DEFAULT_DIGITS = 13;

chai.Assertion.addMethod('infinity', function () {
    this.assert(
        this._obj == Number.POSITIVE_INFINITY || this._obj == Number.NEGATIVE_INFINITY,
        'expected #{this} to be an +/- Infinity',
        'expected #{this} to not be an +/- Infinity'
    );
});
chai.Assertion.addMethod('positiveInfinity', function () {
    this.assert(
        this._obj == Number.POSITIVE_INFINITY,
        'expected #{this} to be an +Infinity',
        'expected #{this} to not be an +Infinity'
    );
});
chai.Assertion.addMethod('negativeInfinity', function () {
    this.assert(
        this._obj == Number.NEGATIVE_INFINITY,
        'expected #{this} to be an -Infinity',
        'expected #{this} to not be an -Infinity'
    );
});
chai.Assertion.addMethod('approx', function (value, digits) {
    var digits = digits === undefined ? DEFAULT_DIGITS : digits;
    var digits = digits - 2;
    var round = function(x) {
        var s = x.toExponential();
        var m = s.match(/([0-9.]+)([eE][+\-]\d+)/);
        var r = +(Math.round(m[1] + "e+" + digits) + "e-" + digits);
        return +(r + m[2]);
    };
    var actual = this._obj;
    var expect = value;
    new chai.Assertion(actual).to.not.infinity();
    new chai.Assertion(expect).to.not.infinity();
    new chai.Assertion(actual).to.not.satisfy(isNaN);
    new chai.Assertion(expect).to.not.satisfy(isNaN);
    new chai.Assertion(round(actual)).to.equal(round(expect));
});

describe('statistics', function(){
    var s = statistics;
    describe('memoize(fn)', function() {
        var fn = s.memoize(function() {
            this.called_with = this.called_with || [];
            this.called_with.push(Array.prototype.slice.call(arguments));
        });
        it('should call fn for the first time', function() {
            fn('a', 'b', 'c');
            expect(fn.called_with).to.deep.equal([['a', 'b', 'c']]);
        });
        it('should not call fn for the second time with same arguments', function() {
            fn('a', 'b', 'c');
            expect(fn.called_with).to.deep.equal([['a', 'b', 'c']]);
        });
        it('should call fn for the second time with different arguments', function() {
            fn(0, 0, 0);
            expect(fn.called_with).to.deep.equal([['a', 'b', 'c'], [0, 0, 0]]);
        });
    });

    describe('factorial(n)', function() {
        it('should return 1 for factorial(0)', function() {
            expect(s.factorial(0)).to.equal(1);
        });
        it('should return 1 for factorial(1)', function() {
            expect(s.factorial(1)).to.equal(1);
        });
        it('should return 2 for factorial(2)', function() {
            expect(s.factorial(2)).to.equal(2);
        });
        it('should return 6 for factorial(3)', function() {
            expect(s.factorial(3)).to.equal(6);
        });
        it('should return 120 for factorial(5)', function() {
            expect(s.factorial(5)).to.equal(120);
        });
        it('should return 2432902008176640000 for factorial(20)', function() {
            expect(s.factorial(20)).to.equal(2432902008176640000);
        });
    });

    describe('contfrac(n, fn)', function() {
        // ref: http://rosettacode.org/wiki/Continued_fraction#Fast_iterative_version
        it('should be able to estimate sqrt2', function() {
            var fn = function(n) {
                return [n > 0 ? 2 : 1, 1];
            };
            expect(s.contfrac(200, fn)).to.approx(1.41421356237309504880);
        });
        it('should be able to estimate napier', function() {
            var fn = function(n) {
                return [n > 0 ? n : 2, n > 1 ? n-1 : 1];
            };
            expect(s.contfrac(200, fn)).to.approx(2.71828182845904523536);
        });
        it('should be able to estimate pi', function() {
            var fn = function(n) {
                return [n > 0 ? 6 : 3, Math.pow(2 * n - 1, 2)];
            };
            expect(s.contfrac(200, fn)).to.approx(3.14159268391980626493);
        });
    });

    describe('range(start[, stop, step, digits])', function() {
        it('should return [0, 1, 2, ..., 7, 8, 9] for range(10)', function() {
            expect(s.range(10)).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        });
        it('should return [0, 3, 6, 9] for range(0, 10, 3)', function() {
            expect(s.range(0, 10, 3)).to.deep.equal([0, 3, 6, 9]);
        });
        it('should return [0, -1, -2, ..., -7, -8, -9] for range(0, -10, -1)', function() {
            expect(s.range(0, -10, -1)).to.deep.equal(
                [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
            );
        });
        it('should return [0, 0.2, 0.4, 0.6, 0.8] for range(0, 1, 0.2, 1)', function() {
            expect(s.range(0, 1, 0.2, 1)).to.deep.equal(
                [0, 0.2, 0.4, 0.6, 0.8]
            );
        });
        it('should return [] for range(0)', function() {
            expect(s.range(0)).to.deep.equal([]);
        });
        it('should return [] for range(1, 0)', function() {
            expect(s.range(1, 0)).to.deep.equal([]);
        });
    });

    describe('sum(X)', function() {
        it('should return 5 for sum([1, 1, 1, 1, 1])', function() {
            expect(s.sum([1, 1, 1, 1, 1])).to.equal(5);
        });
        it('should return 15 for sum([1, 2, 3, 4, 5])', function() {
            expect(s.sum([1, 2, 3, 4, 5])).to.equal(15);
        });
    });
    describe('mean(X)', function() {
        it('should return 3 for mean([1, 2, 3, 4, 5])', function() {
            expect(s.mean([1, 2, 3, 4, 5])).to.equal(3);
        });
        it('should return 22 for mean([1, 2, 3, 4, 100])', function() {
            expect(s.mean([1, 2, 3, 4, 100])).to.equal(22);
        });
        it('should return 3.5 for mean([1, 2, 3, 4, 5, 6])', function() {
            expect(s.mean([1, 2, 3, 4, 5, 6])).to.equal(3.5);
        });
        it('should return 12.5 for mean([1, 2, 3, 4, 5, 60])', function() {
            expect(s.mean([1, 2, 3, 4, 5, 60])).to.equal(12.5);
        });
    });
    describe('median(X)', function() {
        it('should return 3 for median([1, 2, 3, 4, 5])', function() {
            expect(s.median([1, 2, 3, 4, 5])).to.equal(3);
        });
        it('should return 3 for median([1, 2, 3, 4, 100])', function() {
            expect(s.median([1, 2, 3, 4, 100])).to.equal(3);
        });
        it('should return 3.5 for median([1, 2, 3, 4, 5, 6])', function() {
            expect(s.median([1, 2, 3, 4, 5, 6])).to.equal(3.5);
        });
        it('should return 3.5 for median([1, 2, 3, 4, 5, 60])', function() {
            expect(s.median([1, 2, 3, 4, 5, 60])).to.equal(3.5);
        });
    });
    describe('max(X)', function() {
        it('should return 5 for max([1, 2, 3, 4, 5])', function() {
            expect(s.max([1, 2, 3, 4, 5])).to.equal(5);
        });
    });
    describe('min(X)', function() {
        it('should return 1 for max([1, 2, 3, 4, 5])', function() {
            expect(s.min([1, 2, 3, 4, 5])).to.equal(1);
        });
    });
    describe('deviation(X)', function() {
        it('should return [3, 1, 1, 1, 0, 0, -2, -4] for deviation([2, 4, 4, 4, 5, 5, 7, 9])', function() {
            expect(s.deviation([2, 4, 4, 4, 5, 5, 7, 9])).to.deep.equal([3, 1, 1, 1, 0, 0, -2, -4]);
        });
    });
    describe('variance(X)', function() {
        it('should return 4 for variance([2, 4, 4, 4, 5, 5, 7, 9])', function() {
            expect(s.variance([2, 4, 4, 4, 5, 5, 7, 9])).to.equal(4);
        });
    });
    describe('stddev(X)', function() {
        it('should return 2 for variance([2, 4, 4, 4, 5, 5, 7, 9])', function() {
            expect(s.stddev([2, 4, 4, 4, 5, 5, 7, 9])).to.equal(2);
        });
    });

    describe('gamma(z)', function() {
        // ref: http://keisan.casio.com/exec/system/1180573444
        it('should return Infinity for gamma(0)', function() {
            expect(s.gamma(0)).to.positiveInfinity();
        });
        it('should return Infinity for gamma(-1)', function() {
            expect(s.gamma(-1)).to.positiveInfinity();
        });
        it('should return 24 for gamma(5)', function() {
            expect(s.gamma(5)).to.equal(24);
        });
        it('should return approx. -3.5449077018110320546 for gamma(-0.5)', function() {
            expect(s.gamma(-0.5)).to.approx(-3.5449077018110320546);
        });
        it('should return approx. 5.5084317524838131772E+243 for gamma(142.2151)', function() {
            expect(s.gamma(142.2151)).to.approx(5.5084317524838131772E+243);
        });
        it('should return approx. 1.796981857495662584E+308 for gamma(171.6243)', function() {
            expect(s.gamma(171.6243)).to.approx(1.796981857495662584E+308);
        });
        it('should return approx. 1.7979061736313777867E+308 for gamma(171.6244) but Infinity', function() {
            expect(1.7979061736313777867E+308).to.equal(Number.POSITIVE_INFINITY);
            expect(s.gamma(171.6244)).to.equal(Number.POSITIVE_INFINITY);
            //expect(s.gamma(171.6244)).to.approx(1.7979061736313777867E+308);
        });
    });
    describe('gammaln(z)', function() {
        // ref: http://keisan.casio.com/exec/system/1180573442
        it('should return Infinity for gammaln(0)', function() {
            expect(s.gammaln(0)).to.positiveInfinity();
        });
        it('should return Infinity for gammaln(-1)', function() {
            expect(s.gammaln(-1)).to.positiveInfinity();
        });
        it('should return approx. 3.17805383034794561965 for gammaln(5)', function() {
            expect(s.gammaln(5)).to.approx(3.17805383034794561965);
        });
        it('should return approx. 1.26551212348464539649 (real part) for gammaln(-0.5)', function() {
            // Correct result (Imaginary number)
            // 1.26551212348464539649 -3.141592653589793238463i
            expect(s.gammaln(-0.5)).to.approx(1.26551212348464539649);
        });
        it('should return approx. 561.2344575617824232853 for gammaln(142.2151)', function() {
            expect(s.gammaln(142.2151)).to.approx(561.2344575617824232853);
        });
        it('should return approx. 709.7823171539207918558 for gammaln(171.6243)', function() {
            expect(s.gammaln(171.6243)).to.approx(709.7823171539207918558);
        });
        it('should return approx. 709.7828313931115988166 for gammaln(171.6244)', function() {
            expect(s.gammaln(171.6244)).to.approx(709.7828313931115988166);
        });
    });

    describe('beta(a, b[, x])', function() {
        // ref: http://keisan.casio.com/exec/system/1180573394
        it('should return Infinity for beta(0, 0)', function() {
            expect(s.beta(0, 0)).to.positiveInfinity();
        });
        it('should return Infinity for beta(0, 1)', function() {
            expect(s.beta(0, 1)).to.positiveInfinity();
        });
        it('should return Infinity for beta(1, 0)', function() {
            expect(s.beta(1, 0)).to.positiveInfinity();
        });
        it('should return approx. 4.4776093743471688104 for beta(1.5, 0.2)', function() {
            expect(s.beta(1.5, 0.2)).to.approx(4.4776093743471688104);
        });
        it('should return approx. 0.812698412698412698413 for beta(0.5, 5.0)', function() {
            expect(s.beta(0.5, 5.0)).to.approx(0.812698412698412698413);
        });
        it('should return approx. 1.272059085961588988E-104 for beta(171.6243, 171.6243)', function() {
            expect(s.beta(171.6243, 171.6243)).to.approx(1.272059085961588988E-104);
        });
        it('should throw an error for beta(0, 0, 2)', function() {
            var fn = function(){ s.beta(0, 0, 2); };
            expect(fn).to.throw(/invalid x is specified/);
        });
        it('should throw an error for beta(0, 1, 0.5)', function() {
            var fn = function(){ s.beta(0, 1, 0.5); };
            expect(fn).to.throw(/invalid a and\/or b is specified/);
        });
        it('should throw an error for beta(1, 0, 0.5)', function() {
            var fn = function(){ s.beta(1, 0, 0.5); };
            expect(fn).to.throw(/invalid a and\/or b is specified/);
        });
        it('should return approx. 0.04373333333333333333333 for beta(2, 3, 0.4)', function() {
            expect(s.beta(2, 3, 0.4)).to.approx(0.04373333333333333333333);
        });
        it('should return approx. 0.2285226666666666666667 for beta(1, 3, 0.32)', function() {
            expect(s.beta(1, 3, 0.32)).to.approx(0.2285226666666666666667);
        });
    });
    describe('betaln(a, b)', function() {
        // ref: http://keisan.casio.com/exec/system/1180573396
        it('should return Infinity for betaln(0, 0)', function() {
            expect(s.betaln(0, 0)).to.positiveInfinity();
        });
        it('should return Infinity for betaln(0, 1)', function() {
            expect(s.betaln(0, 1)).to.positiveInfinity();
        });
        it('should return Infinity for betaln(1, 0)', function() {
            expect(s.betaln(1, 0)).to.positiveInfinity();
        });
        it('should return approx. log(4.4776093743471688104) for betaln(1.5, 0.2)', function() {
            expect(s.betaln(1.5, 0.2)).to.approx(Math.log(4.4776093743471688104));
        });
        it('should return approx. log(0.812698412698412698413) for betaln(0.5, 5.0)', function() {
            expect(s.betaln(0.5, 5.0)).to.approx(Math.log(0.812698412698412698413));
        });
        it('should return approx. log(1.272059085961588988E-104) for betaln(171.6243, 171.6243)', function() {
            expect(s.betaln(171.6243, 171.6243)).to.approx(Math.log(1.272059085961588988E-104));
        });
    });
    describe('betaic(a, b, x)', function() {
        // ref: http://keisan.casio.com/exec/system/1180573396
        it('should throw an error for betaic(0, 0, 2)', function() {
            var fn = function(){ s.betaic(0, 0, 2); };
            expect(fn).to.throw(/invalid x is specified/);
        });
        it('should throw an error for betaic(0, 1, 0.5)', function() {
            var fn = function(){ s.betaic(0, 1, 0.5); };
            expect(fn).to.throw(/invalid a and\/or b is specified/);
        });
        it('should throw an error for betaic(1, 0, 0.5)', function() {
            var fn = function(){ s.betaic(1, 0, 0.5); };
            expect(fn).to.throw(/invalid a and\/or b is specified/);
        });
        it('should return approx. 0.5248 for betaic(2, 3, 0.4)', function() {
            expect(s.betaic(2, 3, 0.4)).to.approx(0.5248);
        });
        it('should return approx. 0.685568 for betaic(1, 3, 0.32)', function() {
            expect(s.betaic(1, 3, 0.32)).to.approx(0.685568);
        });
    });

    describe('F : Snedecor\'s F distrubution', function() {
        // ref: http://keisan.casio.com/exec/system/1180573185
        describe('calc(u1, s1, n1, u2, s2, n2)', function() {
            it('should return [2, 2, 1] for calc(null, 4, 3, null, 2, 2)', function() {
                expect(s.F.calc(null, 4, 3, null, 2, 2)).to.deep.equal([2, 2, 1]);
            });
            it('should return [3, 5, 3] for calc(null, 6, 6, null, 2, 4)', function() {
                expect(s.F.calc(null, 6, 4, null, 2, 4)).to.deep.equal([3, 3, 3]);
            });
            it('should return [3, 3, 5] for calc(null, 2, 6, null, 6, 4)', function() {
                expect(s.F.calc(null, 2, 4, null, 6, 4)).to.deep.equal([3, 3, 3]);
            });
        });
        describe('pdf(x, d1, d2)', function() {
            it('should return approx. 0.095809142935594120139 for pdf(2.5, 3, 5)', function() {
                expect(s.F.pdf(2.5, 3, 5)).to.approx(0.095809142935594120139);
            });
            it('should return approx. 0.362441840032453211397 for pdf(0.9, 8, 2)', function() {
                expect(s.F.pdf(0.9, 8, 2)).to.approx(0.362441840032453211397);
            });
        });
        describe('cdf(x, d1, d2)', function() {
            it('should return approx. 0.826072342063490103868 for cdf(2.5, 3, 5)', function() {
                expect(s.F.cdf(2.5, 3, 5)).to.approx(0.826072342063490103868);
            });
            it('should return approx. 0.375127304433589073795 for cdf(0.9, 8, 2)', function() {
                expect(s.F.cdf(0.9, 8, 2)).to.approx(0.375127304433589073795);
            });
        });
        describe('pvalue(x, d1, d2)', function() {
            it('should return 0.173927657936509896132 for pvalue(2.5, 3, 5)', function() {
                expect(s.F.pvalue(2.5, 3, 5)).to.approx(0.173927657936509896132);
            });
            it('should return approx. 0.624872695566410926205 for pvalue(0.9, 8, 2)', function() {
                expect(s.F.pvalue(0.9, 8, 2)).to.approx(0.624872695566410926205);
            });
        });
    });
    describe('T : Student\'s T distrubution', function() {
        // ref: http://in-silico.net/tools/statistics/ttest
        // ref: http://keisan.casio.com/exec/system/1180573203
        describe('student(u1, s1, n1, u2, s2, n2)', function() {
            it('should return [approx. -3.5552, 18] for student(45.1, 6.58^2, 10, 56.3, 7.48^2, 10) [equal N]', function() {
                var s1 = Math.pow(6.58, 2);
                var s2 = Math.pow(7.48, 2);
                var t = s.T.student(45.1, s1, 10, 56.3, s2, 10);
                expect(t[0]).to.approx(-3.5552, 5);
                expect(t[1]).to.equal(18);
            });
            it('should return [approx. -3.1266, 14] for student(45.1, 43.3, 7, 56.3, 56, 9) [different N]', function() {
                var s1 = Math.pow(6.58, 2);
                var s2 = Math.pow(7.48, 2);
                var t = s.T.student(45.1, s1, 7, 56.3, s2, 9);
                expect(t[0]).to.approx(-3.1266, 5);
                expect(t[1]).to.equal(14);
            });
        });
        describe('welch(u1, s1, n1, u2, s2, n2)', function() {
            it('should return [approx. -3.1803, 13.7242] for welch(45.1, 43.3, 7, 56.3, 56, 9)', function() {
                var s1 = Math.pow(6.58, 2);
                var s2 = Math.pow(7.48, 2);
                var t = s.T.welch(45.1, s1, 7, 56.3, s2, 9);
                expect(t[0]).to.approx(-3.1803, 5);
                expect(t[1]).to.approx(13.7242, 6);
            });
        });
        describe('calc(u1, s1, n1, u2, s2, n2)', function() {
            it('should return [approx. -3.5552, 18] for calc(45.1, 6.58^2, 10, 56.3, 7.48^2, 10) [equal N, equal s]', function() {
                var s1 = Math.pow(6.58, 2);
                var s2 = Math.pow(7.48, 2);
                var t = s.T.calc(45.1, s1, 10, 56.3, s2, 10);
                expect(t[0]).to.approx(-3.5552, 5);
                expect(t[1]).to.equal(18);
            });
            it('should return [approx. -3.1266, 14] for calc(45.1, 6.58^2, 7, 56.3, 7.48^2, 9) [not equal N, equal s]', function() {
                var s1 = Math.pow(6.58, 2);
                var s2 = Math.pow(7.48, 2);
                var t = s.T.calc(45.1, s1, 7, 56.3, s2, 9);
                expect(t[0]).to.approx(-3.1266, 5);
                expect(t[1]).to.equal(14);
            });
            it('should return [approx. -7.8931, 84.4156] for calc(45.1, 2.58^2, 100, 56.3, 12.48^2, 80) [not equal s]', function() {
                var s1 = Math.pow(2.58, 2);
                var s2 = Math.pow(12.48, 2);
                var t = s.T.calc(45.1, s1, 100, 56.3, s2, 80);
                expect(t[0]).to.approx(-7.8931, 5);
                expect(t[1]).to.approx(84.4156, 6);
            });
        });
        describe('pdf(t, df)', function() {
            it('should return 0.192450089729875254836 for pdf(1, 2)', function() {
                expect(s.T.pdf(1, 2)).to.approx(0.192450089729875254836);
            });
            it('should return 1.80149861164281942145E-4 for pdf(9, 4)', function() {
                expect(s.T.pdf(9, 4)).to.approx(1.80149861164281942145E-4);
            });
        });
        describe('cdf(t, df)', function() {
            it('should return 0.788675134594812882255 for cdf(1, 2)', function() {
                expect(s.T.cdf(1, 2)).to.approx(0.788675134594812882255);
            });
            it('should return 0.9995780837411993608119 for cdf(9, 4)', function() {
                expect(s.T.cdf(9, 4)).to.approx(0.9995780837411993608119);
            });
        });
        describe('pvalue(t, df)', function() {
            it('should return 2 * 0.211324865405187117745 for pvalue(1, 2) *two-tailed', function() {
                expect(s.T.pvalue(1, 2)).to.approx(2 * 0.211324865405187117745);
            });
            it('should return 2 * 4.2191625880063918811E-4 for pvalue(9, 4) *two-tailed', function() {
                expect(s.T.pvalue(9, 4)).to.approx(2 * 4.2191625880063918811E-4);
            });
            it('should return 0.211324865405187117745 for pvalue(1, 2, true) *one-tailed', function() {
                expect(s.T.pvalue(1, 2, true)).to.approx(0.211324865405187117745);
            });
            it('should return 4.2191625880063918811E-4 for pvalue(9, 4, true) *one-tailed', function() {
                expect(s.T.pvalue(9, 4, true)).to.approx(4.2191625880063918811E-4);
            });
        });
    });
});
