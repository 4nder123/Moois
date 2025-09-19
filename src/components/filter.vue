<template>
  <div id="add" class="modal-background">
    <div class="modal">
      <header>
        <button id="close-button" class="close" @click="close">&times;</button>
        <h2>Filter</h2>
      </header>
      <section>
        <div class="done-option">
            Näita tehtuid: 
            <input type="checkbox" @click="setFilter('done')" :checked="!filter.includes('done')" id="switch" />
            <label for="switch">Toggle</label>
        </div>
        <div class="color-options">
            <span>Värv:</span>
            <button
                v-for="color in colors"
                :key="color.name"
                class="color-btn"
                :class="{ selected: !filter.includes(color.name) }"
                @click="setFilter(color.name)"
            >
                <span :class="['color-circle', color.name]"></span>
                {{ color.label }}
            </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'filterModal',
        data() {
            return {
                filter: this.$store.getters["homework/getFilter"],
                colors: [
                    { name: "red", label: "Punane" },
                    { name: "orange", label: "Oranž" },
                    { name: "yellow", label: "Kollane" },
                ],
            };
        },
        methods: {
            setFilter(item) {
                if(this.filter.includes(item)) {
                    this.filter = this.filter.filter(c => c !== item);
                } else {
                    this.filter.push(item);
                }
                this.$store.dispatch('homework/setFilter', this.filter);
            },
        },
        setup(_, { emit }) {
            const close = () => {
                emit('close');
            };
            return { 
                close
            };
        },
    }
</script>
    
<style scoped>
    .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 999;
    }
    .modal {
        margin: 10% auto;
        max-width: 400px;
        box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2), 0 7px 20px rgba(0, 0, 0, 0.17);
    }

    .modal header {
        background: #2c3e50;
        padding: 15px;
        color: #ffffff;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    .modal header h2 {
        margin: 0;
    }

    .modal section {
        padding: 20px;
        background: #fff;
    }
    .close {
        background: none;
        border: none;
        color: #fff;
        font-size: 30px;
        float: right;
        cursor: pointer;
    }

    .close:hover {
        color: #000;
    }
    .color-options {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 20px;
    }
    .color-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 2px solid grey;
        background-color: inherit;
        border-radius: 20px;
        padding: 5px 12px;
        cursor: pointer;
        font-weight: 500;
        color: inherit;
    }
    .color-btn.selected {
        border: 2px solid #2c3e50;
    }
    .color-circle {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: inline-block;
    }
    .color-circle.red {
        background-color: #ff0000;
    }
    .color-circle.yellow {
        background-color: #ffd700;
    }
    .color-circle.orange {
        background-color: #ffa500;
    }

    input[type=checkbox]{
        height: 0;
        width: 0;
        visibility: hidden;
    }
    label[for="switch"] {
        cursor: pointer;
        text-indent: -9999px;
        width: 50px;
        height: 30px;
        background: grey;
        display: block;
        border-radius: 30px;
        position: relative;
    }

    label[for="switch"]:after {
        content: '';
        position: absolute;
        top: 5px;
        left: 5px;
        width: 20px;
        height: 20px;
        background: #fff;
        border-radius: 20px;
        transition: 0.3s;
    }

    input:checked + label[for="switch"] {
        background: #2c3e50;
    }

    input:checked + label[for="switch"]:after {
        left: calc(100% - 5px);
        transform: translateX(-100%);
    }
    .done-option {
        display: flex;
        align-items: center;
    }
</style>