
# Note about the game

The game also offers train stats, reporting last route and all tours, reporting duration, speed, average utilization and waiting time. Also reporting a "total tours" counter, which only updates once the next tour starts. So the very first tour includes the loading time at the start _and_ the loading time for the next tour, so the game stats' tour counter is always off by an error, diminishing as the counter grows.

Waiting time seems to be the time when the train stands still, so loading and unloading contributes to the waiting time.

Each train has a nominal speed in miles per hour, and a track has a nominal distance in miles. Looking at the game, track miles and speed miles are not the same units.

# Note about the trains

## Baldwin Ten-Wheeler

Has a nominal top-speed of 37 miles per hour and a tractive power of 106 percent points. Costs 36.5k.

## Brooks Mogul

Has a nominal top-speed of 47 miles per hour and a tractive power of 103 percent points. Costs 84k.

# Cattle transport setup, medium distance

## Comon setup

Game starts January 1st 1870.

Source is a cattle farm level 5, producing 24 units per week.

Target is a big warehouse (with signal controling), accepting up to 99 units.

So the train loads at the source and unloads at the target, there is no loading at the target or unloading at the source.


## Source: Small train station

Source station is a small train station close to the cattle farm.

Track distance is 71 miles. Height difference of two feet is neglegible. It's a double track, one track per direction. Track signals are placed at the game's default intervals, giving 6 segments plus the respective train station inlets.

### With one Baldwin Ten-Wheeler

Running one Baldwin Ten-Wheeler 4-6-0.

Game stats report roundtrip time of 26 days, top speed 37 mph, waiting time 11 percent.

Speed did not vary much regardless of full load on delivery or zero load on return.

By April, train resources were refilled twice.
By June, train resources were refilled three times.
By July 21st, train resources were refilled four times.

By July 21st, the warehouse reported 64 unites, corresponding to 8 rounds.

So this test covered 201 days for 8 rounds. Ratio of track miles versus speed miles average to 145 to 1.

### With one Brooks Modul

Running one Brooks Mogul.

Game stats report roundtrip time of 23 days, top speed 47 mph, waiting time 13 percent.

Speed with full load reported 39 miles per hour, with zero load reported 47 miles per hour.

By May 14th, train resources were refilled three times.

By May 14th, the warehouse reported 48 unites, corresponding to 6 rounds.

So this test covered 133 days for 6 rounds.

# Cattle transport setup, short distance

## Comon setup

Game starts is deferred to when all trains are well on-route.

Source is a cattle farm level 5, producing 24 units per week.

Target is a big warehouse (with signal controling), accepting up to 99 units.

So the train loads at the source and unloads at the target, there is no loading at the target or unloading at the source.

## Source: Small train station

Source station is a small train station close to the cattle farm.

Track distance is 41 miles. It's a double track, one track per direction. Track signals are placed at the game's default intervals, giving 3 segments plus the respective train station inlets.

### With two Baldwin Ten-Wheeler

Running two Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 4th, completing 1st delivery.
First train loaded 3rd time February 22nd, completing 2nd delivery.
First train loaded 4th time March 13th, completing 3rd delivery.
First train loaded 5th time April 1st, completing 4th delivery.
First train loaded 6th time April 19th, completing 5th delivery.

So this test covered 93 days for five rounds with two trains. The small station dispatched 10 train loads or 80 wagon loads in that time.

### With three Baldwin Ten-Wheeler

Running three Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 4th, completing 1st delivery.
First train loaded 3rd time February 22nd, completing 2nd delivery.
First train loaded 4th time March 13th, completing 3rd delivery.
First train loaded 5th time April 1st, completing 4th delivery.

So this test covered 75 days for four rounds with three trains. The small station dispatched 12 train loads or 96 wagon loads in that time.

### With four Baldwin Ten-Wheeler

Running four Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 9th, completing 1st delivery.
First train loaded 3rd time March 6th, completing 2nd delivery.
First train loaded 4th time March 30th, completing 3rd delivery.

So this test covered 73 days for three rounds with four trains. The small station dispatched 12 train loads or 96 wagon loads in that time.

### With five Baldwin Ten-Wheeler

Running five Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 15th, completing 1st delivery.
First train loaded 3rd time March 18th, completing 2nd delivery.

So this test covered 61 days for two rounds with five trains. The small station dispatched 10 train loads or 80 wagon loads in that time.

### Conclusion

| Trains | Wagon loads/week |
| --- | --- |
| 2 | 6.02 |
| 3 | 8.96 |
| 4 | 9.21 |
| 5 | 9.18 |

For a rural business served by a small train station, loading only at that station, the station maxes out at about 9.2 wagon loads per week.

## Source: Regular train station

Source station is a regular train station close to the cattle farm, with signal controling.

Track distance is 36 miles. It's a double track, one track per direction. Track signals are placed at the game's default intervals, giving 3 segments plus the respective train station inlets.

### With two Baldwin Ten-Wheeler

Running two Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 4th, completing 1st delivery.
First train loaded 3rd time February 23rd, completing 2nd delivery.
First train loaded 4th time March 15th, completing 3rd delivery.
First train loaded 5th time April 3rd, completing 4th delivery.
First train loaded 6th time April 22nd, completing 5th delivery.

So this test covered 96 days for five rounds with two trains. The regular station dispatched 10 train loads or 80 wagon loads in that time.

### With three Baldwin Ten-Wheeler

Running three Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 5th, completing 1st delivery.
First train loaded 3rd time February 25th, completing 2nd delivery.
First train loaded 4th time March 15th, completing 3rd delivery.
First train loaded 5th time April 4th, completing 4th delivery.

So this test covered 78 days for four rounds with three trains. The regular station dispatched 12 train loads or 96 wagon loads in that time.

### With four Baldwin Ten-Wheeler

Running four Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 5th, completing 1st delivery.
First train loaded 3rd time February 24th, completing 2nd delivery.
First train loaded 4th time March 16th, completing 3rd delivery.

So this test covered 59 days for three rounds with four trains. The regular station dispatched 12 train loads or 96 wagon loads in that time.

### With five Baldwin Ten-Wheeler

Running five Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 5th, completing 1st delivery.
First train loaded 3rd time February 24th, completing 2nd delivery.

So this test covered 39 days for two rounds with five trains. The regular station dispatched 10 train loads or 80 wagon loads in that time.

### With six Baldwin Ten-Wheeler

Running six Baldwin Ten-Wheeler 4-6-0.

First train started loading January 16th.
First train loaded 2nd time February 6th, completing 1st delivery.
First train loaded 3rd time February 27th, completing 2nd delivery.

So this test covered 42 days for two rounds with six trains. The regular station dispatched 12 train loads or 96 wagon loads in that time.

### With seven Baldwin Ten-Wheeler

Running seven Baldwin Ten-Wheeler 4-6-0, four to one warehouse and three to another.

First train started loading January 16th.
On March 27th, 160 wagon loads have been dispatched and the 161 started dispatching.

So this test covered 70 days, with the regular station dispatching 160 wagon loads (20 train loads) in that time.

### Preliminary conclusion

| Trains | Wagon loads/week |
| --- | --- |
| 2 | 5.83 |
| 3 | 8.62 |
| 4 | 11.39 |
| 5 | 14.36 |
| 6 | 16.00 |
| 7 | 16.00 |

Six and seven trains land on exactly the same throughput, suggesting the regular station may be plateauing around 16 wagon loads per week. An eight-train run would help confirm whether this is a real ceiling.









