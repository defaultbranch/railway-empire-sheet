# RailwayEmpireSheet

_This is about the game [Railway Empire](https://de.wikipedia.org/wiki/Railway_Empire)._


## Building

```
nx run railway-empire-sheet:test
```




## Concepts


**`goods`** are the types of game commodities produced, transported and consumed.
There are no inherent relations and no essential properties, so all they have is a _`name`_.

There is no single fixed set of `goods` either, different game `scenarios` have different sets
of goods.


**`scenario`** is the game setup. A game setup has a specific map, a specific set of inventions
(or technologies), specific goals, and so on.


**`technologies`** modify game parameters as the game progresses. They affect prices, delays,
available trains and more.


**`cities`** are special zones on the map.

Cities have a _`name`_, a _`population`_ count, a nominal _`size`_ (derived from the `population`
count and governing the maximum number of factories).

A city can host up to two `stations`. With growing size, a city can have up to three factories.
A city cannot host a `warehouse`, but it connects to nearby warehouses.

In the macro view of the map, they are delineated by a
circular boundary; in the micro view, they consist of quatrilateral fields for placing buildings.


**`population demand`**

Cities demand and consume goods in proportion to their population, and with a cut-off (to zero demand)
if the population is below a threshold.

- each good has a specific population threshold
  - incidently, the game lists the goods in the order of that threshold
  - usually, the threshold increments by 5000 people from one good to the next
- basic goods are always required, with population threshold zero
- some goods are not required by the population, only by certain industries, if present


**`businesses types`**

Business types are types of rural `businesses` available in the game.

A `business` produces one type of `good`.

Most businesses exist from the start. In some `scenarios`, some businesses appear anew as the
game time progresses (e.g., a game may start with zero oil wells, and then a number of wells
are spawned one by one during the game).


**`businesses`**

Businesses are placed on the map, outside city limits. Businesses are spawned by the game.
The player cannot construct businesses.


**`industries`**

Industries are the types of `factories` available in the game.

A `factory` consumes one or two types of `goods` and produces one or two types of other `goods`.

While a `factory` of a given size consumes and produces fixed amounts of goods, the `industry` specifies
these amounts for all sizes.


**`factories`**

Factories are placed in cities. A `factory` is an instance of an `industry`. Each city starts with one
factory. With growing population, up to two more `factories` can be constructed.

A factory is not constructible if there is no demand for its product. (It is not clear whether demands
are transitive in that regards; e.g., some `scenarios` start with export warehouses for the ultimate
`good`; if there was a transitive demand, then all factories for the supply chain should be constructible
from the start.)


**`lines`**

A line connects stations and transports goods between them. There may be zero (on-demand), one, or more trains at any given time.


### Types of Lines

This is a details concept. At different stages of the game or of the local development, the type of line that gains
the most money or benefit per time changes.


#### `one-shot line`

- is created on-demand at the producer and runs once to the consumer
- transport volume corresponds to the rate of trains launched, and is independed of the trip duration (or the track distance)
- the rate depends on the production (possibly shared between multiple lines) and the demand (possibly shared between multiple lines)
- benefits:
  - highest return on invested capital (trains always run fully loaded)
- limitations:
  - requires a free primary track at the station to get started, so works fine while produced volume is small
  - requires manual management (creation and destruction), so works fine while the fleet is small; order: roughly once per running train and per game day


### `circular line`

- is set up to run continuously between two stops (prosumer-prosumer)
- transport volume corresponds to the number of trains divided by the duration of the full round-trip
- benefits:
  - makes use of all available station tracks
  - no manual monitoring for ongoing setup and teardown required
- limitations:
  - will only be loaded according to current supply and demand (possibly lowering the return on invested capital)
  - binds invested capital permanently (capital not available elsewhere)


## Organisation/Navigation

- `/goods`
- `/businesses`
- `/businesses/config`
- `/businesses/business?name=`
- `/cities`
- `/cities/config`
- `/cities/city?name=`
- `/stations`
- `/stations/station?id=`
- `/warehouses`
- `/warehouses/warehouse?name=`
- `/lines`
- `/lines/line?id=`


## Evaluation

### Return-on-investments

When investing an amount 'I' for earning an amount 'G' after 'd' days (cycle time),
the daily interest rate is '((I+G)/G)^(1/d)-1'. The weekly and annual interest rate
are '((I+G)/G)^(7/d)-1' and '((I+G)/G)^(365/d)-1', respectively.

- **One-shot lines**
  - investment includes the rural station, the track and the locomotive
  - cycle time is loading time, one-trip time and unloading time
  - gain is the yield (16'000 or more when fully loaded) minus cost for maintenance and deprecation

- **Circular lines**
  - investment is the price of the locomotive plus the participitation in the infrastructure (station and tracks)
  - cycle time is loading time, full-trip time and unloading time (so loading/unloading times are less significant)
  - gain is the yield (16'000 or more when fully loaded) minus cost for maintenance and deprecation

- **Warehouse lines**
  - investment is the price of the locomotive plus the participitation in the infrastructure (station and tracks)
  - we should introduce virtual costs
    - for participating in the earnings of the final delivery
    - costs should be fair, i.e., in proportion to the time

- **Infrastructure**
  - investment is the price for building it
  - we should introduce virtual costs
    - for using the stations
    - for using the tracks
    - costs should be fair, i.e., the gain per infrastructure and the gain per line should be as equal as possible
    - costs should be equivalent to one-shot lines


### Supply

Which places do not receive enough goods from their transport supply?

Which places do not produce enough goods for their  transport demand?
