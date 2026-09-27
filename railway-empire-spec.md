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

### Rural Business

A `Rural Business` is a concrete, placed instance of a `Rural Business Type`, e.g. a specific
logging camp or cattle ranch on the map. It has a name of its own — distinct from the name of
its type, since the map can have several rural businesses of the same type — and a level (1 to
5) determining how much it currently produces, per the production table of its type.

A rural business can be owned by a player. This, together with its own name, is why it is an
entity with identity of its own, rather than being reducible to just a `(type, level)` pair: two
rural businesses of the same type and level remain distinct if they are owned by different
players, or unowned.

Depends on `Rural Business Type`.

### Industry

An `Industry` is a concrete, placed instance of an `Industry Type`. Unlike a rural business, an
industry has no name of its own; it is simply "the meat industry" or "the refinery" at whatever
place it occupies. It still has a level (1 to 5) determining how much it currently converts raw
materials into products, per the recipe of its type.

An industry can be owned by a player, independently of any other industry of the same type. This
is why it is an entity rather than a value object, even though — lacking a name — it carries no
data that a `(type, level)` pair would not already capture on its own.

Depends on `Industry Type`.

## Goods Flow Solver

Sources and sinks never connect directly: rural businesses and city industries produce, city
industries and city populations consume, and everything in between is carried by train lines
running between stations and warehouses. The solver predicts the resulting flow of goods, in
units per week. Only the transport of goods is modelled; passengers and mail are a separate
concern.

The network is a capacitated multi-commodity transshipment graph. Nodes are the stops. A stop
hosting a city contributes sinks — population demand plus the raw-material consumption of that
city's industries — and sources, being those industries' output. A stop hosting rural
businesses contributes their level-based production as sources. This holds for stations and
warehouses alike: neither has demand or supply of its own, and a warehouse's own stock nets to
zero over time, but both expose whatever their host produces and consumes to the network.

What sets a warehouse apart is that it is restricted to the goods it can stock (three for two
tracks, six for four tracks), and that this restriction gates everything passing through it,
transshipment and hosted sources and sinks alike: a good outside the list does not reach the
network through that warehouse at all. So a warehouse configured for Wheat, Corn and Coal, and
connected to both a wheat farm and a logging camp, exposes the farm's wheat but not the camp's
wood. What characterizes a warehouse is then its weekly turn-over volume per good.

Arcs are the directed legs of each line's loop: stops `[A, B, C]` yield `A→B`, `B→C` and
`C→A`, and a two-stop line yields both directions. A train returns to the first stop after the
last, so the legs of one line carry different loads. Each leg has a weekly capacity of
`trains × 8 × 7 / tourDays` units, shared across all goods, since a train carries up to eight
units per run regardless of what it carries. Lines whose tour duration is not yet known are
dropped from the network entirely.

The solve is an iterative proportional allocation to a fixed point, not a globally optimal
flow: trains are greedy and grab what they can, so they do not arrange themselves into an
optimum. Two passes alternate. Demand pressure propagates backwards from the sinks through
arcs and warehouses; supply is then pushed forwards, splitting each source across its outgoing
legs in proportion to their weekly capacity, so that a line with a high weekly transport volume
takes a bigger share than a line with a low one, and rationing each leg's shared capacity
across goods in proportion to the pressure they carry. Damped iteration until the flows
converge handles warehouse-to-warehouse chains and cycles without special-casing them.

Flows are rates, not counts, so the results need not be integral: per-leg and per-good loads,
per-line and per-warehouse turn-over per good, and the fraction of each sink's demand actually
met. None of these are part of the domain model; they are derived output of the solver.

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

### Manage Rural Businesses

Show the set of known rural businesses to the player, as they are discovered during play. The
player can add a new rural business, naming it and picking its type, and update its level as it
grows.

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
