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

## Next Steps

Once this description is captured, the current implementation will be reviewed to derive and
document the domain model.
