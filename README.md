qooxdoo-testrunner
==================

What's that ?
-------------
qooxdoo-testrunner is a phantomjs instructions file that allows to run unit tests directly from the command line.

How to install it ?
-------------------
Clone this repo wherever you want, and follow the instruction found here :
http://news.qooxdoo.org/running-unit-tests-from-the-command-line/

How to use it ?
---------------
Just run the test job with the following command :
./generate.py test -m TESTRUNNER_VIEW:testrunner.view.Console

and when it's done :
phantomjs /your_path/to/testrunner.js file:///home/user/dev/qooxdoo-project/test/index.html

What does it do ?
-----------------
phantomjs is a headless web browser, which means that it does exactly the same thing as your favourite browser, but it is driven by an instructions file and outputs evrything in command line. So the qooxdoo-testrunner is simply an instruction that tells phantomjs :
- run the tests
- read their results and display them in the command line

Can I contact you for a specific need ?
---------------------------------------
No.

Just kidding, of course you can.