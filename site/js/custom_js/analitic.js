function createBarDiagram(data){
	var 
	CHART_WIDTH = document.getElementById('diagram1').offsetWidth,
	CHART_HEIGHT = document.getElementById('diagram1').offsetHeight;
	var chart_area = d3
	.select('#diagram1')
	.append('svg') // Добавляем элемент svg
	.attr('class', 'chart_area') // Задаем класс
	// При задании размеров и координат единицы измерения не указываются
	;
	updateBarDiagram(data);
}
function updateBarDiagram(data){
	var 
	CHART_WIDTH = document.getElementById('diagram1').offsetWidth,
	CHART_HEIGHT = document.getElementById('diagram1').offsetHeight;
	var
	AXIS_SIZE = 30, // Отступ для оси
	PADDING = 5;    // Дополнительный зазор между
	var
	PLOT_AREA_WIDTH = CHART_WIDTH - 2*(AXIS_SIZE + PADDING),
	PLOT_AREA_HEIGHT = CHART_HEIGHT - 2*(AXIS_SIZE + PADDING);
	var
	// Общая высота для каждого прямоугольника =
	// = доступная высота, деленная на число элементов данных

	BAR_AVAIL_HEIGHT = PLOT_AREA_HEIGHT / data.length,
	// Зазоры сверху и снизу прямоугольника
	BAR_SPACING_TOP = 1, BAR_SPACING_BOTTOM = BAR_SPACING_TOP,
	// Собственно высота прямоугольника
	BAR_HEIGHT = BAR_AVAIL_HEIGHT - BAR_SPACING_TOP - BAR_SPACING_BOTTOM;
	var xScale = d3.scaleBand().rangeRound([0, CHART_WIDTH], .03);
	var yScale = d3.scaleLinear().range([CHART_HEIGHT, 0]);
	var chart_area = d3
	.select('#diagram1')
	.selectAll('svg') // Добавляем элемент svg
	.attr('width', CHART_WIDTH)    // ширина
	.attr('height', CHART_HEIGHT)  // и высота
	;
	chart_area.select(".axis").remove();
	chart_area.selectAll("g").remove();
	
	var widthScale = d3.scaleLinear()
	.domain([
	d3.min(data, function(d,i) { return d.earnings-1; }), 
	d3.max(data, function(d,i) { return d.earnings; })  
	])
	.range([0,  PLOT_AREA_WIDTH])
	.nice()
	;
	chart_area
	var bars = chart_area
	.selectAll('g')
	.data(data)
	.enter()
	.append('g')
	;
	
	bars
	.attr('transform', function(d,i) {
	return 'translate(10,'+(AXIS_SIZE + PADDING + i*BAR_AVAIL_HEIGHT + BAR_SPACING_TOP)+')';
	} )
	bars
	.append("rect");
	bars
	.selectAll('rect')
	/* .attr('x', AXIS_SIZE+PADDING)
	// По оси y
	.attr('y', function(d,i){
	// Смещаемся на ширину оси с дополнительным отступом плюс
	// порядковый номер прямоугольника, умноженный на его высоту, и дополнительный зазор
	return AXIS_SIZE + PADDING + i*BAR_AVAIL_HEIGHT + BAR_SPACING_TOP;
	}) */
	.transition()
	.duration(2000)	
	.ease(d3.easeQuad)	
	.attr('fill', function(d, i) { return 'hsl(210,100%,'+(5+widthScale(d.earnings)/10)+'%)'; })
	// Ширина прямоугольника определяется с использованием функции масштабирования
	.attr('width', function(d,i) { return widthScale(d.earnings); } )
	// Высота прямоугольника постоянна
	.attr('height', BAR_HEIGHT )
	;

	bars  
	.append("text")
	.transition()
	.duration(2000)	
	.attr("x", function(d,i) { return widthScale(d.earnings)/2; })
	.attr("y", BAR_HEIGHT / 2)
	.attr("fill", '#fff')
	.attr("dy", ".35em") //vertical align middle
	.text(function(d){
	return d.earnings.toFixed(2);
	})
	;   	
	// Горизонтальная сверху
	var htAxis = d3.axisTop(widthScale);
	// Горизонтальная снизу
	var hbAxis = d3.axisBottom(widthScale);
	chart_area
	.append('g')
	.attr('transform', 'translate(10,'+(AXIS_SIZE)+')')
	.classed('axis', true)
	.call(htAxis)
	;
	var hbaxis_area = chart_area
	.append('g')
	.attr('transform', 'translate(10,'+(CHART_HEIGHT-AXIS_SIZE)+')')
	.classed('axis', true)
	.call(hbAxis)
}

function sqlDate(date){
	dayNow = date.getDate();
	monthNow = date.getMonth()+1;
	yearNow = date.getFullYear();
	prop_date = yearNow+'-'+monthNow+'-'+dayNow;
	return prop_date;
}
function setFilter(selectedDates){
	selectedDates[1]=new Date(selectedDates[1].setHours(23,59));
 		$.ajax({
			type: "POST",
			url: "/analitic",
			data: JSON.stringify({data: selectedDates, method:'setAnalyticFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				 updateBarDiagram(data.data);
				 updateLinerDiagram(data.data);
				 $('.analytic-table .scrolled-content').html(data.html);
			}
		}); 
	}
function updateLinerDiagram(data){
	var
	CHART_WIDTH = document.getElementById('diagram1').offsetWidth,
	CHART_HEIGHT = document.getElementById('diagram1').offsetHeight;
	margin = {top: 20, right: 20, bottom: 30, left: 50},
	width = +CHART_WIDTH - margin.left - margin.right,
	height = +CHART_HEIGHT - margin.top - margin.bottom;
	var svg = d3
	.select("#diagram2")
	.selectAll('svg');
	;
	g = svg.select("g");
	g.selectAll("path").remove();
	g.selectAll("g").remove();
	g.selectAll("clipPath").remove();
	var parseTime = d3.timeParse("%d.%m.%Y");

	 var startData = data.map(function(datum) {
        return 0;
      });

	var x = d3.scaleTime()
	.rangeRound([0, width]);
	var y = d3.scaleLinear()
	.rangeRound([height, 0]);
	

	var area = d3.area()
	.x(function(d) { return x(parseTime(d.date)); })
	.y1(function(d) { return y(d.dohod); })
	  .curve(d3.curveMonotoneX);
	var area2 = d3.area()
	.x(function(d) { return x(parseTime(d.date)); })
	.y1(function(d) { return y(d.res_sum); })
.curve(d3.curveMonotoneX);

	x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));
	y.domain([0, d3.max(data, function(d) { return Math.max(d.dohod,d.res_sum); })]);
	area.y0(y(0));
	area2.y0(y(0));
	g.append("clipPath")
	.attr("id", "rectClip")
	.append("rect")
	//.attr('transform', 'translate(0,' + height + ')')
	.attr("width", 0)
	.attr("height", height);
	
	
	
	var path = g.append("path")
	.datum(data)	
	.attr("fill", "rgb(31, 180, 55)")
	.attr("class", "dc-chart area")
	.attr("d", area)
	.attr("clip-path", "url(#rectClip)");
	
	g.append("path")
	.datum(data)
	.attr("class", "dc-chart area")
	.attr("fill", "rgb(255, 127, 14)")
	.attr("d", area2)
	.attr("clip-path", "url(#rectClip)");
	
	
	legend_item.append('text')
	.attr('x', 10)
	.attr('y', 10)
	.attr('transform', 'translate(0,' + 20 + ')')
	.text('Расходы');
	g.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x));

	g.append("g")
	.call(d3.axisLeft(y))
	.append("text")
	.attr("fill", "#000")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.text("Сумма, грн");

	var totalLength = path.node().getTotalLength();

	path
	.attr("stroke-dasharray", totalLength + " " + totalLength)
	.attr("stroke-dashoffset", totalLength);
    d3.select("#rectClip rect")
      .transition().duration(1000)
		.ease(d3.easeLinear)
		.delay(1000)
        .attr("width", width);
		//.attr('transform', 'translate(0,0)');
}

function createLinerDiagram(data){
	var 
	CHART_WIDTH = document.getElementById('diagram1').offsetWidth,
	CHART_HEIGHT = document.getElementById('diagram1').offsetHeight,
	margin = {top: 20, right: 40, bottom: 30, left: 40},
	width = +CHART_WIDTH - margin.left - margin.right,
	height = +CHART_HEIGHT - margin.top - margin.bottom;
	var svg = d3
	.select("#diagram2")
	.append('svg')
	.attr('class', 'chart_area')
	.attr('width', CHART_WIDTH)
	.attr('height', CHART_HEIGHT)
	;
	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		


		var legend = svg
	.append('g')
	.attr('width', 100)
	.attr('height', 100)
	.attr('class', 'legend')
	.attr('transform', 'translate(' + width + ',' + 20 + ')')
	;
	legend_item = legend
	.append('g')
	.attr('class', 'legend-item')
	;
	legend_item.append('rect')
	.attr('width', 10)
	.attr('height', 10)
	.style('fill', "rgb(31, 180, 55)")
	.style('stroke', "rgb(31, 180, 55)");

	legend_item.append('text')
	.attr('x', 10)
	.attr('y', 10)
	.text('Доходы');
	legend_item = legend
	.append('g')
	.attr('class', 'legend-item')
	;
	legend_item.append('rect')
	.attr('width', 10)
	.attr('height', 10)
	.attr('transform', 'translate(0,' + 20 + ')')
	.style('fill', "rgb(255, 127, 14)")
	.style('stroke', "rgb(255, 127, 14)");


	updateLinerDiagram(data);
}

