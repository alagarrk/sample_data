// Get the form and file field
let fileUploadForm = document.querySelector('#file_upload_form');
let file = document.querySelector('#fileInput');
let imageContainer = document.querySelector('#uploaded_image');

let uploadedImageInfo = { name: '', type: '', dimension: '' };
let uploadedFile = [];
let selectedArea = {};
let pointList = [];

let tooltipCntr = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// To preview the uploaded image
const appendImage = (event) => {
    const imageElement = d3.select("#svg_image_cntr");
    const imagePath = event.target.result;
    // To remove existing image
    resetTableData('#svg_image');

    imageElement.append("svg:image")
        .attr('id', 'svg_image')
        .attr("xlink:href", imagePath)
        .on('load', function () {
            // To set width and height SVG Image Container
            const box = document.getElementById('svg_image').getBBox();
            imageElement
                .attr('width', box.width + 'px')
                .attr('height', box.height + 'px');

            // To show image information
            document.getElementById('image_info').style.display = 'block';
            document.getElementById('image_name').innerHTML = uploadedFile.name;
            document.getElementById('image_dimension').innerHTML = `${box.width}*${box.height}`;
            document.getElementById('image_type').innerHTML = uploadedFile.type;
        })
        // Click event
        .on('click', function () {
            selectedArea = {};
            const modalWindow = d3.select("#description_modal");
            modalWindow
                .style("top", d3.mouse(d3.event.currentTarget)[1] + 50 + "px")
                .style("left", d3.mouse(d3.event.currentTarget)[0] - 100 + "px")
                .style("display", 'block');
            document.getElementById("desc_input_field").value = ''; // To reset the text value
            selectedArea = { x: Math.round(d3.mouse(d3.event.currentTarget)[0]), y: Math.round(d3.mouse(d3.event.currentTarget)[1]), description: '' };
        });
}


const uploadImage = (event) => {
    // Stop the form from reloading the page
    event.preventDefault();

    if (!file.value.length) return;

    uploadedFile = file.files[0];
    // Create a new FileReader() object
    let reader = new FileReader();

    // Read the file
    reader.readAsDataURL(file.files[0]);
    reader.onload = appendImage;
}

// To save description 
const saveDescription = () => {
    const textBoxValue = document.getElementById("desc_input_field").value;
    if (textBoxValue !== '') {
        selectedArea.description = textBoxValue;
        pointList.push(selectedArea);
        closeDescriptionModal();
        d3.select("#svg_image_cntr").append("circle")
            .attr("transform", "translate(" + selectedArea.x + "," + selectedArea.y + ")")
            .attr("r", 5)
            .attr('data-description', textBoxValue)
            .attr("class", "highlight-circle")
            .style("cursor", "pointer")
            .on("mouseover", function (d) {
                tooltipCntr.transition()
                    .duration(200)
                    .style("opacity", .6);
                tooltipCntr.html(this.getAttribute('data-description'))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltipCntr.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        generatePointTable();
    }
}

const generatePointTable = () => {
    resetTableData('.selected_point'); // To reset the table and update with new dataset
    document.getElementById('point-list-cntr').style.display = 'block';

    let table = document.getElementById('selected_points_table');
    pointList.forEach(function (data) {
        const row = document.createElement('tr');
        row.setAttribute('class', "selected_point");
        Object.entries(data).forEach(function (value) {
            const cell = document.createElement('td');
            cell.innerHTML = value[1];
            row.appendChild(cell);
        });
        table.appendChild(row);
    });
}

const resetTableData = (element) => {
    const elems = document.querySelectorAll(element);
    [].forEach.call(elems, function (el) {
        el.remove()
    });
}

// To close the description modal
const closeDescriptionModal = () => {
    document.getElementById('description_modal').style.display = 'none';
}

// Listen for submit event
fileUploadForm.addEventListener('submit', uploadImage);