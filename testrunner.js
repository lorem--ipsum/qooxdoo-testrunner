(function() {
    
    //--------------------------------------------------------------------------
    // Variables
    //--------------------------------------------------------------------------
    
    var testClasses = phantom.args[0];
    var runnerUrl = phantom.args[1];
    var url = testClasses ? "" + runnerUrl + "?testclass=" + testClasses : "" + runnerUrl;
    var page = new WebPage();

    var loadedBefore = false;
    
    
    //--------------------------------------------------------------------------
    //
    // Functions
    // 
    //--------------------------------------------------------------------------
    
    var log_die = function(msg) {
        console.log("Bail out! " + msg);
        phantom.exit(1);
    };

    var log = function(msg) {
        console.log(msg);
    }
    
    var getRunnerStateAndResults = function(p) {
        return p.evaluate(function() {
            var runner;
            var state;
            
            try {
                runner = qx.core.Init.getApplication().runner;
                state = runner.getTestSuiteState();
            } catch (error) {
                log_die("Error while getting the test runners state and results");
                return [null, null];
            }
            if (state === "finished") {
                return [state, runner.view.getTestResults()];
            } else {
                return [state, null];
            }
        });
    };
    
    var getSpaces = function(string) {
        var st = "";
        for (var i = 0; i < string.length; i++) {
            st += " ";
        }
        
        return st;
    };
    
    var printOnly = function(current, old, after) {
        var oldPath = old.split(/\./g);
        var currentPath = current.split(/\./g);
        
        var sp = [];
        var ret = [];
        
        for (var i = 0; i < currentPath.length; i++) {
            if (
                oldPath[i] === undefined
                ||
                oldPath[i] !== currentPath[i]
                ||
                ret.length !== 0
            ) {
                ret.push(currentPath[i]);
            } else if (i === currentPath.length - 1) {
                sp.push(getSpaces(currentPath[i]));
            } else {
                sp.push(getSpaces(currentPath[i]));
            }
        }
        
        var pathWithoutLast = currentPath.concat();
        pathWithoutLast.pop();
        var under = getSpaces(pathWithoutLast.join(".")) + "  └- " + after;
        
        if (sp.length > 0) {
            if (ret.length == 0) {
                console.log(under);
                return;
            }
            
            console.log(current + "\n" + under);
            return;
        }
        
        console.log(ret.join(".") + "\n" + under);
        return;
    };
    
    var parseResults = function(map) {
        var results = {
            ok: 0,
            nok: 0,
            test_classes: {}
        };
        for (var key in map) {
            var splitted = key.split(/^\w+\.test\.((?:\w+\.)+(\w+))\s*:\s*test\s*:?\s*(.*)$/g)
            
            var path = "ex." + splitted[1];
            var classname = splitted[2];
            var test_label = splitted[3];
            var messages = (map[key].messages[0] || "").replace(/\s+$/g, "");
            var state = map[key].state;
            
            if (!results.test_classes[path]) {
                results.test_classes[path] = {
                    name: classname,
                    tests: [],
                    all: 0,
                    ok: 0
                }
            }
            
            var test_class = results.test_classes[path];
            
            test_class.tests.push({
                label: test_label,
                messages: messages,
                state: (state === "success" ? "OK" : "NOK")
            });
            
            if (state === "success") {
                test_class.ok++;
                results.ok++;
            } else {
                results.nok++;
            }
            
            test_class.all++;
        }
        
        return results;
    };
    
    var printResults = function(map) {
        for (var key in map.test_classes) {
            var test_class = map.test_classes[key];
            var summary = "(" + test_class.ok + "/" + test_class.all + ")\t" + key;
            
            if (test_class.ok === test_class.all) {
                console.log(summary);
            } else {
                console.log(summary);
                
                for (var i = 0; i < test_class.tests.length; i++) {
                    var t = test_class.tests[i];
                    console.log("\t[" + t.state + "]\t" + t.label);
                    if (t.messages !== "") {
                        console.log("\t      >>> " + t.messages.replace(/\n/g, "\n\t        > "));
                    }
                }
            }
        }
        console.log("================================");
        
        var ok = map.ok;
        var nok = map.nok;
        console.log("(" + ok + " passed, " + nok + " failed)");
        
        return (nok === 0 ? 0 : 1);
    };
    
    var processTestResults = function() {
        // Getting the runner state and result
        var _ref = getRunnerStateAndResults(page);
        var state = _ref[0];
        var results = _ref[1];
        
        if (!state) {
            return;
        }
      
        if (state === "error") {
            log_die("Error running tests");
        }
      
        if (state === "finished") {
            return phantom.exit(printResults(parseResults(results)));
        }
    };
    
    //--------------------------------------------------------------------------
    //
    // Main part
    // 
    //--------------------------------------------------------------------------
    
    page.open(url, function(status) {
        if (status !== "success") {
            log_die("Unable to load page : " + url);
        }
        
        if (loadedBefore) {
            return;
        }
        
        loadedBefore = true;
    
        page.evaluate(
            function() {
                if (typeof qx === "undefined") {
                    log_die("qooxdoo not found");
                    return;
                }
                
                var runner = qx.core.Init.getApplication().runner;
                
                return runner.addListener(
                    "changeTestSuiteState",
                    function(e) {
                        if (e.getData() === "ready") {
                            return runner.view.run();
                        }
                    }
                );
            }
        );
    
    
    return window.setInterval(processTestResults, 500);
  });
}).call(this);
