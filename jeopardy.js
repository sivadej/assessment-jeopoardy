console.log('app init');

const API_URL_CATEGORIES = 'http://jservice.io/api/categories';
const API_URL_CLUES = 'http://jservice.io/api/clues';
const NUM_OF_CATEGORIES = 6;
const QUESTIONS_PER_CAT = 5;
const categories = [];
const btnRestart = document.getElementById('restart');

btnRestart.addEventListener('click', gameStart);

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function gameStart(){
	categories.length = 0;
	const catsToGet = await getCategoryIds();
	for (let catId of catsToGet) {
		categories.push(await getCategory(catId));
	}
	fillTable();
}

//function getCategoryIds(){}
async function getCategoryIds(){
	const categories = await axios.get(API_URL_CATEGORIES, {
		params: {
			count: 100,
			offset: Math.floor(Math.random() * 10000)
		}
	});
	const catIdsArray = [];
	// Insert un-sampled category IDs into array
	for (let cat of categories.data) {
		catIdsArray.push(cat.id);
	}
	// Return 6 IDs chosen randomly from array of 100 items
	return _.sampleSize(catIdsArray, 6);
}

//function getCategory(catId)
async function getCategory(catId){
	const clues = await axios.get(API_URL_CLUES, {
		params: {
			category: catId
		}
	});
	const title = clues.data[0].category.title;
	const clueArray = [];
	for (let clue of clues.data) {
		clueArray.push({ question: clue.question, answer: clue.answer, showing: null });
	}
	return {
		title,
		clues: _.sampleSize(clueArray, 5)
	};
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM-QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */

async function fillTable(){
	const header = document.querySelector('#jeopardy thead');
	const board = document.querySelector('#jeopardy tbody');

	let headerHTML = '';
	for (let i = 0; i < NUM_OF_CATEGORIES; i++) {
		headerHTML += `<td><b>${categories[i].title.toUpperCase()}</b></td>`;
	}
	header.innerHTML = `<tr>
        ${headerHTML}
	</tr>`;

	//create game spots with xy coords as attributes
	// QUESTIONS_PER_CAT <=> board height
	// NUM_OF_CATEGORIES <=> board width

	for (let y = 0; y < QUESTIONS_PER_CAT; y++) {
		const row = document.createElement('tr');
		for (let x = 0; x < NUM_OF_CATEGORIES; x++) {
			const cell = document.createElement('td');
			cell.setAttribute('id', `cell-${x}-${y}`);
			cell.setAttribute('data-x', x);
			cell.setAttribute('data-y', y);
			cell.innerText = '?';
			row.append(cell);
		}
		board.append(row);
	}
	board.addEventListener('click', handleClick);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt){
	evt.preventDefault();
	const selectedSpot = document.getElementById(evt.target.id);
	const x = selectedSpot.dataset.x;
	const y = selectedSpot.dataset.y;

	//reveal question on first click, reveal answer if question is shown
	selectedSpot.innerHTML =
		selectedSpot.innerText === '?' ? `${categories[x].clues[y].question}` : `${categories[x].clues[y].answer}`;
}
