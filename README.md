# Toronto Bike Share Visualizer

## Why

> Disclaimer: Obviously the details and functionality of this extension may change over time, but it solves a need in the now, rather than hoping for better UX on BikeShares end.

It all started when I wanted to just get an overview/some simple stats on my own Bike Share [activity](https://members.bikesharetoronto.com/overview). However, the site just has a list of your rides, with a quite annoying process of grabbing it.

![img of bike share ride list](readme/Screen%20Shot%202023-03-20%20at%206.46.25%20PM.png)

Within _any_ custom time window, the site only displays the last `50` entries (at most). Sadly, it has no pagination 🤦.

So what I really needed to achieve as a baseline, was a way to grab all of my data. I figured that within 15 day chunks, `50` rides would be reasonable, and to get all my rides I'd just need to decrement by said chunks until I reach the "Bikeshare epoch", which is around 2011 (though 2014 is when it became [Bikeshare Toronto](https://en.wikipedia.org/wiki/Bike_Share_Toronto). However I can't say if there was a data migration between those times, so I am keeping it there to be safe.

# How do I use it

Ok you're a Bikeshare user who's stumbled on this repository (pending its official release on the chrome store).

To use it, simply download the latest release (on the Github release page). You can follow instructions listed [here](https://dev.to/ben/how-to-install-chrome-extensions-manually-from-github-1612). Since I provide a .zip, you will need to make sure to extract it first.
