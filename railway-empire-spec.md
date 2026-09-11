# Railway Empire Sheet — Specification

## Background

"Railway Empire" is a series of computer games where the player manages train connections
between cities and rural businesses on a map, to deliver goods, passengers and mail.

The name "Railway Empire Sheet" stems from the fact that the first simulation stats were
captured and forecasted on a spreadsheet. This repository is a hand-written tool built from
those early ideas. It is far from perfect, but it now serves to capture the underlying ideas,
derive a spec, and regenerate a new version of the tool.

## Game Mechanics

### Map

On a map, there are cities, having a population, and rural businesses, having a level. Both
city population and business level determine how much the corresponding place consumes or
produces.

### Goods

The game has a number of goods. The number is usually fixed, but the set of goods can vary
from scenario to scenario.

Goods are not equal. While the price per unit is the same, some goods are produced and
consumed in higher quantities, others in small or low quantities. This is why each rural
business comes with its own table of how much it can produce per level, and likewise for
industries. Businesses and industries can consume and produce up to two goods, with a fixed
conversion rate from input goods to output goods.

### Cities

A city can have up to three industries, depending on the city size. An industry also has a
level, determining how much resources it can convert into products per week.

A city has a stock of goods that feeds local consumption by population and industries, and
stores produced goods. There is an upper limit to how much a city can store of each good; it
is not yet clear what this limit depends on.

Cities start small and only demand a small set of basic goods, plus any goods needed in their
industries. Other goods don't sell in the city, so trains cannot unload these there.

As cities grow, further goods come into demand one by one. The demand scales with the number
of citizens, so it does not start at zero for later goods.

Each city may have a special building. Some buildings are built by a player, to gain some kind
of bonus. In some scenarios, there are special buildings that will buy and consume an
unlimited amount of a particular good, i.e. they act like export points to an infinite market.

### Players and Network Building

Multiple players operate on the map. Technically, each player starts from a home town. In the
beginning, players can build train stations only either in their home town, or anywhere on the
map outside towns and businesses.

Next to their home town, players can integrate other towns into their network. For this
purpose, they can build one extra station in a town that is not yet in their network, but no
more than one. Once that station has a railway track connection to a town in the player's
network, the city becomes "connected".

Breaking the connection afterwards does not demote this status; theoretically, a player can
connect all cities by connecting to one, destroying the connection, connecting to the next,
destroying that connection, and so on. This is a minor game glitch. Note that at the time the
connection is made, the new connection only counts if there is an unbroken track connection
from the new station to the home town; so once a player abandons the home town, the city
network cannot grow anymore.

Rural businesses, on the other hand, are connected by building a train station or warehouse
station in reach of that business, and connecting it to the network.

### Stations and Warehouses

There are three sizes of train stations, with one, two and four tracks, respectively. There
are two sizes of warehouses, with two and four tracks, respectively.

The loading time depends on the size of the station or warehouse; bigger ones have a faster
turn-around than smaller ones. Normal warehouses can store up to three goods, big warehouses up
to six goods.

Warehouses act like train stations, in that they can ship goods from rural businesses in reach
nearby. Likewise, they can also ship goods from and to nearby cities. Later in the game, this
greatly helps to take load off city train stations, avoiding congestion problems.

### Trains, Revenue and Growth

A train can transport up to eight units of goods, passengers or mail. Goods pay by the unit.
Passengers and mail pay by unit and distance, it seems.

Money is made in the game when goods, passengers or mail are unloaded in a city.

## Domain Model

The state of a game must be discoverable: a game can start with an empty set of goods, rural
business types and industry types, and the player adds new ones to these sets as they become
relevant during play. The domain model is built up from a small number of entities, recorded
here roughly in the order they need to exist.

### Good

A `Good` is the atomic building block of the domain model: just a name identifying a type of
commodity (e.g. "Madera", "Ganado", "Carne").

A good has no inherent structure or relations of its own — it is not fixed as a "raw material"
or a "product". The same good can be the output of one rural business or industry and the
input of another (e.g. "Madera" is harvested by a rural business, and also consumed as a raw
material by a furniture industry). Which role a good plays is determined by the recipes of the
rural business types and industry types that reference it, not by the good itself.

Every other entity (rural business types, industry types, city demand curves, lines, ...)
refers to goods by name. The set of goods is not fixed by the game engine; different scenarios
start with different sets, and new goods can be discovered/added as the game progresses.

### Rural Business Type

A `Rural Business Type` is a template for a rural business, e.g. "Madera" (logging), "Ganado"
(cattle ranch). It has a name, and a production table: the amount of a good produced per week,
for each of the five business levels (level 1 to 5).

A rural business type only produces, it does not consume any good. This is the simplest
producer template in the domain model, depending only on `Good`.

As with goods, the set of rural business types is not fixed; it can start empty and grow as new
types are discovered/added during the game.

### Industry Type

An `Industry Type` is a template for an industry, e.g. "Industria cárnica" (meat industry),
"Refinerías" (refineries). It has a name, and a recipe: one or two raw-material goods consumed
per week, and one or two product goods produced per week, for each of the five industry levels
(level 1 to 5).

Unlike a rural business type, an industry type both consumes and produces goods. It depends
only on `Good`, same as a rural business type.

As with rural business types, the set of industry types is not fixed; it can start empty and
grow as new types are discovered/added during the game.

### Demand

A `Demand` describes the population's per-week appetite for a good: the good itself, a minimum
city population below which the good is not demanded at all, and a demand rate (wagons per week
per million citizens) applied once that threshold is met.

A demand is a value object rather than an entity in its own right: it is fully characterized by
its data, and it is really an attribute of a `Good` describing the good's role in city
population consumption, keyed by the good's name rather than a separate identity.

A good is associated with no demand, or exactly one demand.

As with goods, rural business types and industry types, the set of demands is not fixed; it can
start empty and grow as new goods enter demand during the game.

## View Concerns

A view concern is a distinct piece of functionality the player needs, independent of how it
ends up bundled into an actual screen. As the list of concerns evolves, concerns may overlap,
so the final set of views may well be fewer than the set of concerns.

### Manage Goods

Show the set of known goods to the player. The player can add new goods, and remove existing
ones.

### Manage Rural Business Types

Show the set of known rural business types to the player, as they are discovered during play.
The player can add new types, and remove existing ones.

The production table of a type is not fully known upfront either: businesses start at level 1,
and only once a business reaches a higher level does the player get to see the coefficient for
the corresponding entry in the production table.

### Manage Industry Types

Show the set of known industry types to the player, as they are discovered during play. The
player can add new types, and remove existing ones.

As with rural business types, the recipe of an industry type is not fully known upfront:
industries start at level 1, and only once an industry reaches a higher level does the player
get to see the coefficients for the corresponding entry in the raw-material and product tables.

### Manage Demands

Show the set of known demands to the player, similar to managing the set of goods. This concern
is likely implemented in the same view as Manage Goods, but the final grouping of concerns into
views is left open for now.

## Next Steps

Once this description is captured, the current implementation will be reviewed to derive and
document the domain model.
