
var selectedTime = '9am';
var selectedDate = (new Date()).toLocaleDateString();
var selectedBoat = 'roseBoat';

function loadXml(xmlFile) {
	if(window.XMLHttpRequest)
	{
		xmlhttp = new XMLHttpRequest();
	}
	else{
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.open("GET", xmlFile, false);
	xmlhttp.send();
	xmlDoc = xmlhttp.responseXML;

	var result = [];
	var radios = document.getElementsByName("boat");
	
	var boatContainer = xmlDoc.getElementsByTagName("BOATS")[0];
	
	var boats = boatContainer.getElementsByTagName("BOAT");
	
	var boatLayout = null;
	for(var i = 0; i < boats.length; i++){
		if(boats[i].getAttribute("NAME") == selectedBoat.toUpperCase()){
			boatLayout = boats[i];
			break;
		}
	}
	
	var seats = boatLayout.getElementsByTagName("SEAT");
	//var getRoseBoat = xmlDoc.getElementsByTagName("ROSEBOAT")[0];
	//var getPrincessBoat = xmlDoc.getElementsByTagName("PRINCESSBOAT")[0];

	
	//var seats = radios[0].checked ?
	//getRoseBoat.getElementsByTagName("SEAT")
	//:
	//getPrincessBoat.getElementsByTagName("SEAT");
			
	for (var i = 0; i < seats.length; i++) {
		
		var seat = {};
		var fields = seats[i].children;
		seat.row = parseInt(fields[0].innerHTML);
		seat.column = parseInt(fields[1].innerHTML);
		seat.price = parseInt(fields[2].innerHTML);
		seat.status = fields[3].innerHTML;
		if(fields[4]) {
			seat.exists = false; 
		} else {
			seat.exists = true;
		}
		
		if (!result[seat.row - 1]) {
			result[seat.row -1 ] = []; 
		}
		result[seat.row - 1][seat.column - 1] = seat;
	}

	return result;
}

function generateTable(seatsArr) {
	var tbl="<table>";

	for (var i = 0; i < seatsArr.length; i++) {
		tbl += "<tr>";
		var seatRow = seatsArr[i];

		for (var j = 0; j < seatRow.length; j++) {
			var currentSeat = seatRow[j];
			tbl += "<td ";

			if (currentSeat.exists === false) {
				tbl += "class='hide' ";
			} else {
				if (currentSeat.status == "available") {
					var isSold = checkTicket(currentSeat);
					if(isSold){
						tbl += "class='sold' ";
					}else{
						tbl += "class='available' ";
					}
					
				} else {
					tbl += "class='sold' ";
				}
			}

			tbl += "row=" + currentSeat.row + " column=" + currentSeat.column
				 	+ " exists=" + currentSeat.exists
					+ " price=" + currentSeat.price + " status=" + currentSeat.status;

			tbl += "></td>";

			if (currentSeat.column === 4) {
				tbl += "<td class='corridor'></td>"
			}
		}
		
		tbl += "</tr>";
	}
	tbl +="</table>";

	return tbl;
}

function render() {
	var showSeats = document.getElementById("showSeats");
	var xmlData = loadXml("boat-seats-new.xml");
	var tableDom = generateTable(xmlData);
	showSeats.innerHTML = tableDom;
	
}

function checkTicket(seat){
	var isSold = false;
	var bookedTickets = JSON.parse(localStorage.getItem('tickets')) || [];
	for(var k = 0; k < bookedTickets.length; k++){
		var tempTicket = bookedTickets[k];
		if(tempTicket.boat == selectedBoat && tempTicket.date == selectedDate && tempTicket.time == selectedTime){
			if(tempTicket.row == seat.row && tempTicket.column == seat.column && tempTicket.status == "paid"){
				isSold = true;		
			}
		}
	}
	return isSold;
}

function booking(){
	// var details=document.getElementById("details").innerHTML;
	// details = "Total cost:";
	var tds = document.getElementsByTagName("td");
	for(var i = 0; i < tds.length; i++) {
		tds[i].onclick =  function(e) {		
			var td = e.target;
			var status = td.attributes['status'];
			if(status == null){
				return;
			}
			
			var exits = td.attributes["exists"];
			if(exits && exits.value.toUpperCase() == "FALSE"){
				return;
			}
			
			if(status.value === "available"){	
				if(td.style.backgroundColor == "pink"){
					td.style.backgroundColor = "skyblue";
				   	removeTicket(td);
				   
				   }else{
					   td.style.backgroundColor = "pink";
						insertTicket(td);
				
				   }
				showTickets();
				
			}
			else alert("you can only select available seats");	
		}
	}
}


var tickets = [];
function insertTicket(td){
	var row = td.attributes['row'].value;
	var column = td.attributes['column'].value;
	var price = td.attributes['price'].value;
	var status = td.attributes['status'].value;

	tickets.push({ 'boat': selectedBoat, 'date': selectedDate, 'time': selectedTime, 'row': row, 'column': column, 'price': price, 'status': 'unpaid'});
}

function removeTicket(td){
	var row = td.attributes['row'].value;
	var column = td.attributes['column'].value;
	for(var i=0; i < tickets.length; i++){
		var ticket = tickets[i];
		if(ticket.row == row && ticket.column == column){
			tickets.splice(i, 1);
			break;
		}
	}
}


function showTickets(){
	if(tickets.length == 0){
		document.getElementById("ticketZone").innerHTML = "";
		return;
	}
	var tbl="<table>";
	tbl += '<tr><th>Date</th><th>Time</th><th>Row</th><th>Seat</th><th>Price</th></tr>';
	var totalCost = 0;
	for (var i = 0; i < tickets.length; i++) {
		tbl += "<tr>";
		var ticket = tickets[i];
		tbl += "<td>" + ticket.date + "</td>";
		tbl += "<td>" + ticket.time + "</td>";
		tbl += "<td>" + ticket.row + "</td>";
		tbl += "<td>" + ticket.column + "</td>";
		tbl += "<td>" + ticket.price + "</td>";
		tbl += "</tr>";
		totalCost += parseFloat(ticket.price);
	}
	tbl	+= "<td>Total Cost: </td>"
	tbl	+= "<td colspan='4'>" + totalCost +"</td>";
	tbl +="</table>";
	document.getElementById("ticketZone").innerHTML = tbl;
}
		
		
		
function submit(){
	if(tickets.length == 0){
		alert('Please select a seat at first!');
		return;
	}
	var tds = document.getElementsByTagName("td");
	for(var i=0;i<tds.length;i++){
		if(tds[i].style.backgroundColor == 'pink'){
			tds[i].style.backgroundColor = "blue";
			tds[i].attributes['status'].value = 'sold';
		}
	}
	
	for(var i = 0; i< tickets.length; i++) {
		 if(tickets[i].status == 'unpaid'){
			 tickets[i].status = 'paid';
		 }
	}
	
	
	var bookedTickets = JSON.parse(localStorage.getItem('tickets'));
	bookedTickets = bookedTickets.concat(tickets);
	localStorage.setItem('tickets', JSON.stringify(bookedTickets));
	
	tickets = [];
	showTickets();
	
	alert("congratulations! Have fun!");
}


function handleChange(obj, type)
{
	if(type == 'time'){
		selectedTime = obj.value;
	}else if(type == 'boat'){
		selectedBoat = obj.value;
	}
	
	render();
	
	booking();
	tickets = [];
	showTickets();
	
}


window.onload = function() {
	render();
	booking();
	
	
	
}


