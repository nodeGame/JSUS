# Statistical tests for JSUS random number generators

TESTFILE <- '/tmp/gaussTest.csv' # mean 0, std = 2
data <- read.table(TESTFILE, head = TRUE)

mean <- 0
sd <- 2
N <- 10000
gaussian <- rnorm(N, mean = mean, sd = sd)


mean(gaussian)
mean(data$N)

sd(gaussian)
sd(data$N)

summary(data$N)
summary(gaussian)

qqnorm(data$N)

shapiro.test(data[1:5000,])

ks.test(gaussian,data$N)

ks.test(gaussian,gaussian)

qqnorm(gaussian)

sqrt(1000)
