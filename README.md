# RailwayEmpireSheet

_This is about the game [Railway Empire](https://de.wikipedia.org/wiki/Railway_Empire)._


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



## Organisation/Navigation

_tbd_
