/**
 * # RANDOM
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collection of static functions related to the generation of
 * pseudo-random numbers.
 * ---
 */
(function(JSUS) {

    function RANDOM(){};

    /**
     * ## RANDOM.random
     *
     * Generates a pseudo-random floating point number between
     * (a,b), both a and b exclusive.
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     * @return {number} A random floating point number in (a,b)
     */
    RANDOM.random = function(a, b) {
        var c;
        a = ('undefined' === typeof a) ? 0 : a;
        b = ('undefined' === typeof b) ? 0 : b;
        if (a === b) return a;

        if (b < a) {
            c = a;
            a = b;
            b = c;
        }
        return (Math.random() * (b - a)) + a
    };

    /**
     * ## RANDOM.randomInt
     *
     * Generates a pseudo-random integer between (a,b] a exclusive, b inclusive
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     * @return {number} A random integer in (a,b]
     *
     * @see RANDOM.random
     */
    RANDOM.randomInt = function(a, b) {
        if (a === b) return a;
        return Math.floor(RANDOM.random(a, b) + 1);
    };

    /**
     * ## RANDOM.sample
     *
     * Generates a randomly shuffled sequence of numbers in (a,b)
     *
     * Both _a_ and _b_ are inclued in the interval.
     *
     * @param {number} a The lower limit
     * @param {number} b The upper limit
     * @return {array} The randomly shuffled sequence.
     *
     * @see RANDOM.seq
     */
    RANDOM.sample = function(a, b) {
        var out;
        out = JSUS.seq(a,b)
        if (!out) return false;
        return JSUS.shuffle(out);
    };

    /**
     * ## RANDOM.sample
     *
     * Returns a new generator of normally distributed pseudo random numbers
     *
     * The generator is independent from RANDOM.nextNormal
     * 
     * @return {function} An independent generator 
     * 
     * @see RANDOM.nextNormal
     */
    RANDOM.getNormalGenerator = function() {

        return (function() {

            var oldMu, oldSigma;    
            var x2, multiplier, genReady;    
            
            return function normal(mu, sigma) {
                
                var x1, u1, u2, v1, v2, s;
                
                if ('number' !== typeof mu) {
                    throw new TypeError('nextNormal: mu must be number.');
                }
                if ('number' !== typeof sigma) {
                    throw new TypeError('nextNormal: sigma must be number.');
                }

                if (mu !== oldMu || sigma !== oldSigma) {
                    genReady = false;
                    oldMu = mu;
                    oldSigma = sigma;
                }

                if (genReady) {     
                    genReady = false;
                    return (sigma * x2) + mu;
                }
                
                u1 = Math.random();
                u2 = Math.random();
                
                // Normalize between -1 and +1.
                v1 = (2 * u1) - 1;
                v2 = (2 * u2) - 1; 
                
                s = (v1 * v1) + (v2 * v2);
                
                // Condition is true on average 1.27 times, 
                // with variance equal to 0.587.
                if (s >= 1) {
                    return normal(mu, sigma);
                }
                
                multiplier = Math.sqrt(-2 * Math.log(s) / s);
                
                x1 = v1 * multiplier;
                x2 = v2 * multiplier;
                
                genReady = true;
                
                return (sigma * x1) + mu;
                
            }
        })();
    }

    /**
     * Generates random numbers with Normal Gaussian distribution.
     *
     * User must specify the expected mean, and standard deviation a input 
     * parameters.
     *
     * Implements the Polar Method by Knuth, "The Art Of Computer
     * Programming", p. 117.
     * 
     * @param {number} mu The mean of the distribution
     * param {number} sigma The standard deviation of the distribution
     * @return {number} A random number following a Normal Gaussian distribution
     *
     * @see RANDOM.getNormalGenerator
     */
    RANDOM.nextNormal = RANDOM.getNormalGenerator();

    /**
     * Generates random numbers with LogNormal distribution.
     *
     * User must specify the expected mean, and standard deviation of the
     * underlying gaussian distribution as input parameters.
     * 
     * @param {number} mu The mean of the gaussian distribution
     * @param {number} sigma The standard deviation of the gaussian distribution
     * @return {number} A random number following a LogNormal distribution
     *
     * @see RANDOM.nextNormal 
     */
    RANDOM.nextLogNormal = function(mu, sigma) {
        if ('number' !== typeof mu) {
            throw new TypeError('nextLogNormal: mu must be number.');
        }
        if ('number' !== typeof sigma) {
            throw new TypeError('nextLogNormal: sigma must be number.');
        }
        return Math.exp(nextNormal(mu, sigma));
    }

    /**
     * Generates random numbers with Exponential distribution.
     *
     * User must specify the lambda the _rate parameter_ of the distribution.
     * The expected mean of the distribution is equal to `Math.pow(lamba, -1)`. 
     * 
     * @param {number} lambda The rate parameter
     * @return {number} A random number following an Exponential distribution
     */
    RANDOM.nextExponential = function(lambda) {
        if ('number' !== typeof lambda) {
            throw new TypeError('nextExponential: lambda must be number.');
        }
        if (lambda <= 0) {
            throw new TypeError('nextExponential: lambda must be greater than 0.');
        }
        return - Math.log(1 - Math.random()) / lambda;
    }
    
    /**
     * Generates random numbers following the Binomial distribution.
     *
     * User must specify the probability of success and the number of trials.
     * 
     * @param {number} p The probability of success
     * @param {number} trials The number of trials
     * @return {number} sum The sum of successes in n trials
     */
    RANDOM.nextBinomial = function(p, trials) {
        var counter, sum;

        if ('number' !== typeof p) {
            throw new TypeError('nextBinomial: p must be number.');
        }
        if ('number' !== typeof trials) {
            throw new TypeError('nextBinomial: trials must be number.');
        }
        if (p < 0 || p > 1) {
            throw new TypeError('nextBinomial: p must between 0 and 1.');
        }
        if (trials < 1) {
            throw new TypeError('nextBinomial: trials must be greater than 0.');
        }
        
        counter = 0;
        sum = 0;
        
        while(counter < trials){
	    if (Math.random() < p) {	
	        sum += 1;
            }
	    counter++;
        }
	
        return sum;
    };

    /**
     * Generates random numbers following the Gamma distribution.
     *
     * This function is experimental and untested. No documentation.
     *
     * @experimental
     */
    RANDOM.nextGamma = function(alpha, k) {
        var intK, kDiv, alphaDiv;
        var u1, u2, u3;
        var x, i, len, tmp;

        if ('number' !== typeof alpha) {
            throw new TypeError('nextGamma: alpha must be number.');
        }
        if ('number' !== typeof k) {
            throw new TypeError('nextGamma: k must be number.');
        }
        if (alpha < 1) {
            throw new TypeError('nextGamma: alpha must be greater than 1.');
        }
        if (k < 1) {
            throw new TypeError('nextGamma: k must be greater than 1.');
        }

        u1 = Math.random();
        u2 = Math.random();
        u3 = Math.random();

        intK = Math.floor(k) + 3;
        kDiv = 1 / k;
        
        alphaDiv = 1 / alpha;

        x = 0;
        for (i = 3 ; ++i < intK ; ) {
            x += Math.log(Math.random());
        }

        x *= - alphaDiv; 

        tmp = Math.log(u3) * 
            (Math.pow(u1, kDiv) /
             ((Math.pow(u1, kDiv) + Math.pow(u2, 1 / (1 - k)))));
        
        tmp *=  - alphaDiv;
        
        return x + tmp;
    }

    JSUS.extend(RANDOM);

})('undefined' !== typeof JSUS ? JSUS : module.parent.exports.JSUS);