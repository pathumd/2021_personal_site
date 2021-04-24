const terminal = document.querySelector(".terminal");
const hydra = document.querySelector(".hydra");
const rebootSuccessText = document.querySelector(".hydra_reboot_success");
const maxCharacters = 24;
const unloadedCharacter = ".";
const loadedCharacter = "#";
const spinnerFrames = ["/", "-", "\\", "|"];

// Clone the element and give the glitch classes
(glitchElement => {
	const glitch = glitchElement.cloneNode(true);
	const glitchReverse = glitchElement.cloneNode(true);
	glitch.classList.add("glitch--clone", "glitch--bottom");
	glitchReverse.classList.add("glitch--clone", "glitch--top");
	glitch.setAttribute("aria-hidden", "true");
	glitchReverse.setAttribute("aria-hidden", "true");

	glitchElement.insertAdjacentElement("afterend", glitch);
	glitchElement.insertAdjacentElement("afterend", glitchReverse);
})(terminal);

// Get all the loading bars
const loadingBars = document.querySelectorAll(".loading-bar");
const processAmounts = document.querySelectorAll(".process-amount");
const spinners = document.querySelectorAll(".spinner");
const rebootingText = document.querySelectorAll(".hydra_rebooting");
const glitches = document.querySelectorAll(".glitch--clone");

// Helper for random number
const RandomNumber = (min, max) => Math.floor(Math.random() * max) + min;

const Delay = (time) => {
	return new Promise((resolve) => setTimeout(resolve, time))
};

const HideAll = elements =>
	elements.forEach(glitchGroup =>
		glitchGroup.forEach(element => element.classList.add("hidden"))	);

const ShowAll = elements =>
	elements.forEach(glitchGroup =>
		glitchGroup.forEach(element => element.classList.remove("hidden")) );

// Render the bar to HTML
const RenderBar = ( values ) => {
	const currentLoaded = values.lastIndexOf(loadedCharacter) + 1;
	const loaded = values.slice(0, currentLoaded).join("");
	const unloaded = values.slice(currentLoaded).join("");

	// Update all the loading bars
	loadingBars.forEach(loadingBar => {
		loadingBar.innerHTML = `(${loaded}<span class="loading-bar--unloaded">${unloaded}</span>)`;
	});

	// Update all the percentages
	loadingPercent = Math.floor(currentLoaded / maxCharacters * 100);
	processAmounts.forEach(processAmount => {
		processAmount.innerText = loadingPercent;
	});
};

// Update the loaded value and render it to HTML
const DrawLoadingBar = ( values ) => {
	return new Promise((resolve) => {
			const loadingBarAnimation = setInterval(() => {
				if (!values.includes(unloadedCharacter)) {
					clearInterval(loadingBarAnimation);
					resolve();
				}

				values.pop(unloadedCharacter);
				values.unshift(loadedCharacter);
				RenderBar(values);
		}, RandomNumber(50, 300));
	});
};

const DrawSpinner = (spinnerFrame = 0) => {
	return setInterval(() => {
		spinnerFrame += 1;
		spinners.forEach(
			spinner =>
				(spinner.innerText = `[${
					spinnerFrames[spinnerFrame % spinnerFrames.length]
				}]`)
		);
	}, RandomNumber(50, 300));
};

const AnimateBox = () => {
	const first = hydra.getBoundingClientRect();
	HideAll([spinners, glitches, rebootingText]);
	rebootSuccessText.classList.remove("hidden");
	rebootSuccessText.style.visibility = "hidden";
	const last = hydra.getBoundingClientRect();

	const hydraAnimation = hydra.animate([
		{ transform: `scale(${first.width / last.width}, ${first.height / last.height})` },
		{ transform: `scale(${first.width / last.width}, 1.2)` },
		{ transform: `none` }
	],{
		duration: 600,
		easing: 'cubic-bezier(0,0,0.32,1)',
	});	

	hydraAnimation.addEventListener('finish', () => {
		rebootSuccessText.removeAttribute("style");
		hydra.removeAttribute("style");
	});
};

const PlayHydra = async() => {
	terminal.classList.add("glitch");
	rebootSuccessText.classList.add("hidden");
	ShowAll([spinners, glitches, rebootingText]);
	const loadingBar = new Array(maxCharacters).fill(unloadedCharacter);
	const spinnerInterval = DrawSpinner();

	// Play the loading bar
	await DrawLoadingBar(loadingBar);
	
	// Loading is complete on the next frame, hide spinner and glitch
	requestAnimationFrame(()=> {
		clearInterval(spinnerInterval);
		terminal.classList.remove("glitch");
		AnimateBox();
		setTimeout(PlayHydra, 10000);
	});
};

PlayHydra();