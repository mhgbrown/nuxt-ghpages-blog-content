---
title: Un-cyanogenmoding a Motorola Droid
date: 1376722800000
---


Un-cyanogenmoding a Motorola Droid
==================================

This summer I took a course in Android development at [Carnegie Mellon
University Silicon Valley](http://www.cmu.edu/silicon-valley/) (CMUSV),
where I finished up a Master's degree in Software Engineering.  CMUSV
was gracious enough to lend each student an original Motorola Droid to
develop with.  Unfortunately, my Droid had been rooted and was running
[Cyanogenmod](http://www.cyanogenmod.org/), which is great if you are
interested in any of the feature-set extensions that it provides.  For
learning purposes and to avoid any platform inconsistencies, I figured I
should be working on "pure" Android.  The following steps detail how to
restore a Droid to its original glory on Mac OS X: 

1.  [Download the sbf\_flash program](http://goo.gl/4cQmE).  This is
    used to load the new (well, original) firmware.
2.  [Download the original firmware](http://goo.gl/g9MCI%20).  I think
    this particular file is Verizon specific, but I'm not sure to what
    extent that matters --- it could just be Verizon's file.  My phone
    wasn't activated so I didn't deal with the cellular connection.
3.  Shutdown the phone
4.  Press and hold the *up* (towards the screen) button on the D-pad and
    press the power button until the screen lights up.
5.  You should see something similar to

`        Bootloader        <version number>         Battery OK        OK to Program        Connect USB        Data Cable`

1.  Plug the phone into your computer
2.  The screen should read something like 

`        Transfer Mode: USB`

1.  Open Terminal and navigate to where you downloaded sbf\_flash
2.  Run `sbf_flash /path/to/original/firmware`
3.  Wait...
4.  Rejoice! Your phone should be back to its old self again.

References:

1.  [goo.gl/4cQmE[ ]{.invisible}](http://t.co/26M36tFIyE "http://goo.gl/4cQmE"){.twitter-timeline-link}
2.  [goo.gl/g9MCI[ ]{.invisible}](http://t.co/317aHIZGe1 "http://goo.gl/g9MCI"){.twitter-timeline-link}
3.  [goo.gl/xIAqh[ ]{.invisible}](http://t.co/Hye5xaIsQe){.twitter-timeline-link}

