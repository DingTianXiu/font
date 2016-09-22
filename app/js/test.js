/**
 * Created by dtx on 16/9/22.
 */


var layout = d3.layout.cloud()
    .size([500, 500])
    .words([
        "Hello", "world", "normally", "you", "want", "more", "words","Hello", "world", "normally", "you", "want", "more", "words","Hello", "world", "normally", "you", "want", "more", "words","Hello", "world", "normally", "you", "want", "more", "words","Hello", "world", "normally", "you", "want", "more", "words",
        "than", "this"].map(function(d) {
        return {text: d, size: 10 + Math.random() * 90, test: "haha"};
    }))
    .padding(5)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .text(function (d) {return d.text})
    .padding(10)
    .on("end", draw);

layout.start();

function draw(words) {
    var fill = d3.scale.category20();
    d3.select("body").append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; })
        .on("click",function () {
            d3.selectAll("text").style("outline","none");
            d3.select(this)
            .style("background","red");
        });
}
