const express = require("express");

const router = express.Router();

router.use(express.json());

const projects = require("./data/helpers/projectModel.js");
const actions = require("./data/helpers/actionModel.js");

//middleware
const validateProject = (req, res, next) => {
    const body = req.body;
    
    if(Object.keys(body).includes("name") && Object.keys(body).includes("description")) {
        next();
    }
    else{
        res.status(400).json({
            errorMessage: "Project requires Name and Description fields."
        })
    }
}

const validateAction = (req, res, next) => {
    const body = req.body;
    const keys = Object.keys(body);

    if(keys.includes("project_id") && keys.includes("description") && keys.includes("notes")) {
        if(body.description.length <= 128) {
            next();
        }
        else{
            res.status(400).json({
                errorMessage: "Description can only hold up to 128 characters. Please reduce."
            })
        }
    }
    else {
        res.status(400).json({
            errorMessage: "Actions require a project id, description, and notes."
        })
    }
}

const validateId = (req, res, next) => {
    const id = req.params.id;

    projects.get(id)
        .then(project => {
            if(project === null) {
                res.status(404).json({
                    errorMessage: "A project with that ID could not be found."
                })
            }
            else {
                next();
            }
        }) 
        .catch(err => {
            res.status(500).json({
                errorMessage: "An error occured while trying to find a project with that ID."
            })
        })   
}

const validateActionId = (req, res, next) => {
    const id = req.params.id2;

    actions.get(id)
        .then(action => {
            if(action === null) {
                res.status(404).json({
                    errorMessage: "An action with this ID could not be found."
                })
            }
            else{
                next();
            }
        })
        .catch(err => {
            res.status(400).json({
                errorMessage: "An action with this ID could not be found."
            })
        })
}

//get all projects
router.get("/projects", (req, res) => {
    projects.get()
        .then(projects => {
            res.status(200).json(projects)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error returning a list of projects."
            })
        })
})

//get all actions of a project
router.get("/projects/:id/actions", validateId, (req, res) => {
    projects.getProjectActions(req.params.id)
        .then(actions => {
            res.status(200).json(actions)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error finding the actions for this project."
            })
        })
})

//create a project
router.post("/projects", validateProject, (req, res) => {
    projects.insert(req.body)
        .then(project => {
            res.status(201).json(project)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error trying to create this project."
            })
        })
})

//update a project
router.put("/projects/:id", validateId, validateProject, (req, res) => {
    projects.update(req.params.id, req.body)
        .then(project => {
            res.status(200).json(project)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error trying to update this project."
            })
        })
})

//delete a project
router.delete("/projects/:id", validateId, (req, res) => {
    projects.remove(req.params.id)
        .then(deleted => {
            res.status(200).json(deleted)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error while trying to delete this project."
            })
        })
})

//get all actions
router.get("/actions", (req, res) => {
    actions.get()
        .then(actions => {
            res.status(200).json(actions)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error returning a list of actions."
            })
        })
})

//add an action to a project
router.post("/actions/:id", validateId, validateAction, (req, res) => {
    actions.insert(req.body)
        .then(action => {
            res.status(201).json(action);
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "An error occured trying to create this action."
            })
        })
})

//update an existing action
router.put("/actions/:id/:id2", validateId, validateActionId, validateAction, (req, res) =>{
    actions.update(req.params.id2, req.body)
        .then(action => {
            res.status(200).json(action)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "There was an error trying to update this action."
            })
        })
})

//delete an action
router.delete("/actions/:id/:id2", validateId, validateActionId, (req, res) => {
    actions.remove(req.params.id2)
        .then(deleted => {
            res.status(200).json(deleted)
        })
        .catch(err => {
            res.status(500).json({
                errorMessage: "An error occured trying to delete this action."
            })
        })
})

module.exports = router;