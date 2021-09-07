import { elementController } from "../../core";
import { scrollToBottom } from "../../helpers/scroll";
import {
  hideEmptyResultsSection,
  showEmptyResultsSection,
} from "../../helpers/display-empty-results";
import getPlantsList from "../../services/plans-api";

/** @typedef {import('../../entities/Plant').default} Plant */

export default elementController(
  "section-plants-results",
  ({ root, query }) => {
    const visibleResultsSectionClass = "section-plants-results--visible";
    const cardsHolder = query(".section-plants-results__cards-holder");

    (function listenForSelection() {
      window.addEventListener("user-selected-values", _handleOnSelectFilters);
    })();

    async function _handleOnSelectFilters(e) {
      const {
        "sunlight-select": sunlight,
        "water-select": water,
        "chew-select": chew,
      } = e?.detail;

      const plants = await getPlantsList({ sunlight, water, chew });
      const hasPlants = !!plants.length;

      if (hasPlants) {
        hideEmptyResultsSection();
        _renderCards(plants);
        _makeResultsVisible();
        root.scrollIntoView();
      } else {
        showEmptyResultsSection();
        _makeResultsHide();
        scrollToBottom();
      }
    }

    function _makeResultsVisible() {
      root.classList.add(visibleResultsSectionClass);
    }

    function _makeResultsHide() {
      root.classList.remove(visibleResultsSectionClass);
    }

    /** @param {Plant[]} plants  */
    function _renderCards(plants) {
      if (!!cardsHolder) {
        cardsHolder.innerHTML = plants
          .sort((plant) => (plant.staffFavorite ? -1 : 1)) //put staff favorite first
          .map((plant) => _plantCardMarkup(plant))
          .join("\n");
      }
    }

    /** @param {Plant} plant */
    function _getIcons(plant) {
      const toxicIcon = plant.toxicity
        ? _iconMarkup("ic-toxic")
        : _iconMarkup("ic-pet-friendly");

      const sunIcon =
        {
          no: _iconMarkup("ic-no-sunlight"),
          low: _iconMarkup("ic-low-sunlight"),
          high: _iconMarkup("ic-high-sunlight"),
        }[plant.sun] || "";

      const waterIcon =
        {
          regularly: _iconMarkup("ic-regularly-water"),
          rarely: _iconMarkup("ic-rarely-water"),
          daily: _iconMarkup("ic-daily-water"),
        }[plant.water] || "";

      return `
        ${toxicIcon}
        ${sunIcon}
        ${waterIcon}
      `;
    }

    function _iconMarkup(id, desc = "") {
      return `
      <div class="plant-card__icon" title="${desc}">
        <svg>
          <use xlink:href="#${id}"></use>
        </svg>
      </div>`;
    }

    /** @param {Plant} plant */
    function _plantCardMarkup(plant) {
      const isStaffFavorite = !!plant.staffFavorite;
      const mainClass = "plant-card";
      const favoriteClass = isStaffFavorite ? `${mainClass}--favorite` : "";
      const elementClass = `${mainClass} ${favoriteClass}`;
      const title = `<h2 class="plant-card__title">${plant.name}</h2>`;
      const price = `<p class="plant-card__price">${plant.formattedPrice}</p>`;

      return `
        <div class="${elementClass}">
          ${
            isStaffFavorite
              ? '<div class="plant-card__staff-favorite-flag"><h3>✨ Staff favorite</h3></div>'
              : ""
          }
          <div class="plant-card__image-holder">
            <img src="${plant.url}" alt="plant image" />
          </div>
          <div class="plant-card__text-content">
            ${!isStaffFavorite ? title : ""}
            <div class="plant-card__desc">
              <div class="plant-card__left">
                ${isStaffFavorite ? title : ""}
                ${!isStaffFavorite ? price : ""}
              </div>
              <div class="plant-card__right">
                ${isStaffFavorite ? price : ""}
                <div class="plant-card__icons">
                  ${_getIcons(plant)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
);
