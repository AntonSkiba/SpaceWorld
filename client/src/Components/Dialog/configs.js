const configs = {
    styleDialog: {
        default: {
            background: "#a4a4a4",
            overlay: "rgba(0, 0, 0, 0.6)",
        },
        cold: {
            background: "#a5b7d3",
            overlay: "rgba(10, 20, 50, 0.6)",
        },
        warm: {
            background: "#f0be99",
            overlay: "rgba(125, 45, 5, 0.6)",
        },
        nature: {
            background: "#9bd99a",
            overlay: "rgba(0, 69, 6, 0.6)",
        },
        space: {
            background: "#02000f",
            overlay: "rgba(0, 0, 0, 0.8)",
        },
    },

    styleCanvas: {
        default: {
            sky: 0xdddddd,
            light: 0xffffff,
            grid: 0xffffff,
        },
        cold: {
            sky: 0xeaf0ff,
            light: 0xdbeaff,
            grid: 0x7d8597,
        },
        warm: {
            sky: 0xffe9d9,
            light: 0xf9dcc4,
            grid: 0xfec89a,
        },
        nature: {
            sky: 0xe1ffdb,
            light: 0x9dff7d,
            grid: 0x72a168,
        },
        space: {
            sky: 0x030024,
            light: 0xffffff,
        },
    },

    styleButton: {
        default: {
            text: "Light",
            style: {
                backgroundColor: "rgba(0, 0, 0, 0.2)",
            },
            order: 0,
        },
        cold: {
            style: {
                backgroundColor: "rgba(0, 24, 69, 0.4)",
            },
            text: "Cold",
            order: 1,
        },
        warm: {
            style: {
                backgroundColor: "rgba(242, 152, 89, 0.4)",
            },
            text: "Warm",
            order: 2,
        },
        nature: {
            style: {
                backgroundColor: "rgba(84, 196, 81, 0.4)",
            },
            text: "Nature",
            order: 3,
        },
    },

    standButton: {
        grid: {
            style: {
                backgroundImage:
                    "linear-gradient(rgba(0, 0, 0, 0.4) .1em, transparent .1em), linear-gradient(90deg, rgba(0, 0, 0, 0.4) .1em, transparent .1em)",
                backgroundSize: "17.8px 19px",
            },
            text: "Grid",
            order: 0,
        },
        plane: {
            style: {
                backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
            text: "Plane",
            order: 1,
        },
        stand: {
            text: "Stand",
            order: 2,
        },
    },
};

export default configs;