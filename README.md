# War Thunder Vehicles API

<a href='https://ko-fi.com/E1E6RA850' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi4.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

>⚠ Due to user abuse I added rate limiting: 10K requests (separate for assets and JSON data) are allowed in a 72H window from the same domain/IP. Any attempt to bypass this limit (using VPN or domain/IP spoofing) will result in IP ban.  Users are **strongly** encouraged to implement some kind of caching, especially for assets. For larger traffic I suggest hosting the API yourself.


The War Thunder Vehicles API provides comprehensive data retrieval for all in-game vehicles, including hidden and event-specific vehicles. Access detailed information on vehicle performance, economic costs, armaments, and weapon presets. As the API is under active development, please note that some data may be subject to updates and corrections.

Explore the full documentation [here](http://wtvehiclesapi.sgambe.serv00.net/docs).


A [new page](https://wtvehiclesapi.sgambe.serv00.net/differences) has been added. It allows to view differences across game versions of the same vehicle. It's ugly I know. If you are a good web developer and willing to improve it, I'll accept your PR.

## Features
- Localization for:
  - Weapons
  - Vehicles
  - Ammos
  - Ammo types
  - Explosives
- All BR ranges
- Hidden vehicles, premiums, packs
- Extended economy data
- Engine parameters
- Thermal and night vision data
- Vehicles versions across multiple updates
- Modifications
- Tech tree prerequisites
- Custom presets
- Images

### Upcoming
- Radar/Sensors data
- AAM / ATGM data

## Disclaimer
This API is an independent project and is not affiliated with Gaijin Entertainment in any capacity.
