# coffeelint: disable=no_debugger

module.exports = ->
  object = {}

  continue_button = ["Continue"]

  object.study_intro_pages = do ->
    pages = [
      # {
      #   name: "intro"
      #   # text: "Welcome to the study."
      #   # options: continue_button
      #   images: [ "IntroPic_small.jpg" ]
      #   options: continue_button
      # },
    ]

    return pages

  object.study_outro_pages = [
    {
      name: "outro"
      text: "Thank you."
    }
  ]

  layouts_a = [
    "Ballon"
    "CirclePacking"
    "Classical"
    "HCL"
    "Icicle"
    "Radial"
    "TreeMap"
  ]

  data_map_a = do ->
    array = [
      [1, "caspase"]
      [2, "erbb2"]
      [3, "gpcr"]
      [4, "flare"]
      [5, "carnivora"]
    ]
    new Map(array)

  dataIds = Array.from data_map_a.keys()

  dataIds_5 = d3.range(1,6)

  options_a = d3.range 1, 21

  defaultImageFunction = (imagesFolder, layout, dataId, subtreeId) ->
    # folder = if imagesFolder? then "#{imagesFolder}/" else ""
    folder = "#{imagesFolder}/"
    [
      "#{folder}#{layout}#{dataId}.png"
    ]
  # coffeelint: disable=max_line_length

  object.task_blocks = [
    {
      name: "height_and_degree"
      layouts: layouts_a
      dataIds: dataIds_5
      image_folder: "Study1.1-2"
      imagesFunction: defaultImageFunction
      pageHook: (page) ->
        console.log page
      intro_pages: [
        {
          name: "intro"
          text: "<h3>Study 1.1-2</h3>"
          # text: "Welcome to the study."
          # options: continue_button
          images: [ "Study1.1-2/introImage/intro.png" ]
          options: continue_button
          _pageHook: (page) -> 
            d3.selectAll(".image").style
              "height": "800px"
              margin: 0
            d3.select(".text").style
              height: "150px"
        }
        # {
        #   text: "height and degree intro 2"
        #   options: continue_button
        # }
      ]
      question_pages: [
        {
          questionName: "height?"
          text: "What is the &nbsp;<span style='font-weight: 800; color: #30AD30'>height</span>&nbsp; of the tree?"
          options: options_a
        },
        {
          questionName: "degree?"
          text: "What is the &nbsp;<span style='font-weight: 800; color: #ab0000'>degree</span>&nbsp; of the tree?"
          options: options_a
        }
      ]
    }
    {
      name: "subtree"
      layouts: layouts_a
      dataIds: [3, 4]
      subtreeIds: [1, 2]
      image_folder: "Study1.3"
      imagesFunction: (imagesFolder, layout, dataId, subtreeId) -> [
        "#{imagesFolder}/#{layout}#{subtreeId}.png"
        "#{imagesFolder}/#{layout}#{dataId}.png"
      ]
      pageHook: (page) ->
        if page.questionName is "subtree?"
          d3.selectAll("img").style("max-height", "60%")
      intro_pages: [
        {
          name: "intro"
          text: "<h3>Study 1.3</h3>"
          images: [ "Study1.3/introImage/intro.png"]
          options: continue_button
          _pageHook: (page) -> 
            d3.selectAll(".image").style
              "height": "1100px"
              margin: 0
            d3.select(".text").style
              height: "150px"
            d3.select(".buttons").style
              "margin-bottom": "100px"
        }
        # {
        #   text: "subtree intro"
        #   options: continue_button
        # }
        # {
        #   text: "subtree intro 2"
        #   options: continue_button
        # }
      ]
      question_pages: [
        {
          questionName: "subtree?"
          text: "How many copies of the tree on the left exist in the tree
          on the right?"
          options: options_a
        }
      ]
    }
    {
      name: "hops"
      layouts: layouts_a
      dataIds: dataIds_5
      image_folder: "Study2.1"
      imagesFunction: defaultImageFunction
      intro_pages: [
        {
          name: "intro"
          text: "
          <div>
          <h3>Study 2.1</h3>
          <p>In this study, we will be asking questions related to the 
          connectivity between nodes.</p>
          <p>
          The examples below show the same dataset using seven different 
          visualization techniques.<br>
          In these examples, there are <b>four hops</b> from the 
          <span style='color: #dd0'> yellow </span> node to
          the <span style='color: #0d0'> green</span> node.</p>
          <p>
          In some cases, the two selected nodes can be <b>disconnected</b>.</p>
          </div>"
          images: [ "Study2.1/introImage/intro.png"]
          options: continue_button
        }
        # {
        #   text: "height and degree intro 2"
        #   options: continue_button
        # }
      ]
      pageHook: (page) -> d3.select(".text").style("height", "100px")
      question_pages: [
        {
          questionName: "hops?"
          text: "<p>How many hops are on the path between
            the node highlighted
            in <span style='color: #dd0'> yellow </span> and
            the node highlighted
            in <span style='color: #0d0'> green</span>?<p>"
          options: options_a.concat ["Not connected."]
        }
      ]
    }
    {
      name: "connected"
      layouts: layouts_a
      dataIds: dataIds_5
      image_folder: "Study2.2"
      imagesFunction: defaultImageFunction
      intro_pages: [
        {
          name: "intro"
          text: "
          <div>
          <h3>Study 2.2</h3>
          <p>In this study, we will be asking questions related to the 
          connectivity of leaf nodes associated with a given 
          <span style='color: #F090F0'> parent </span> node.</p>
          <p>
          The examples below show the same dataset using seven different 
          visualization techniques.<br>
          In these examples, the <span style='color: #00f'>blue leaf nodes</span>
          within the selected parent
          node:
          <ul><li>are <b>not</b> connected to
          their siblings.</li>
          <li>are <b>connected</b> to descendants of their siblings</li>
          <li>are <b>connected</b> to other relatives through the ancestor
          of the parent</p>
          </div>
          "
          images: [ "Study2.2/introImage/intro.png"]
          options: continue_button
        }
      ]
      question_pages: [
        {
          questionName: "connected 1?"
          text: "
          <div>
          <h5>Connectivity within a parent node</h5>
          <ol>
          <li style='color: #000'>
          Are any <span style='color: #00f'> blue </span> (leaf) nodes 
          in the selected <span style='color: #F090F0'> parent </span> 
          connected to their <span style='color: #00f'> sibling leaf nodes</span>?
          </li>
          <li style='color: #ddd'>
          Are any blue (leaf) nodes
          in the selected parent
          connected to any <b>non-sibling descendants</b> 
          of the parent?
          </li>
          <li style='color: #ddd'>
          Are any blue (leaf) nodes
          in the selected parent
          connected to other leaf nodes through the ancestor
          of the parent?
          </li>
          </ol>
          </div>"
          options: ["Yes", "No"]
        }
        {
          questionName: "connected 2?"
          text: "
          <div>
          <h5>Connectivity within a parent node</h5>
          <ol>
          <li style='color: #ddd'>
          Are any blue (leaf) nodes 
          in the selected parent
          connected to their sibling leaf nodes?
          </li>
          <li style='color: #000'>
          Are any <span style='color: #00f'> blue </span> (leaf) nodes
          in the selected <span style='color: #F090F0'> parent </span>
          connected to any <b>non-sibling descendants</b> 
          of the <span style='color: #F090F0'> parent</span>?
          </li>
          <li style='color: #ddd'>
          Are any blue (leaf) nodes
          in the selected parent
          connected to other leaf nodes through the ancestor
          of the parent?
          </li>
          </ol>
          </div>"
          options: ["Yes", "No"]
        }
        {
          questionName: "connected 3?"
          text: "
          <div>
          <h5>Connectivity within a parent node</h5>
          <ol>
          <li style='color: #ddd'>
          Are any blue (leaf) nodes 
          in the selected parent
          connected to their sibling leaf nodes?
          </li>
          <li style='color: #ddd'>
          Are any blue (leaf) nodes
          in the selected parent
          connected to any <b>non-sibling descendants</b> 
          of the parent?
          </li>
          <li style='color: #000'>
          Are any <span style='color: #00f'> blue </span> (leaf) nodes
          in the selected <span style='color: #F090F0'> parent </span>
          connected to other leaf nodes through the ancestor
          of the <span style='color: #F090F0'> parent </span>?
          </li>
          </ol>
          </div>"
          options: ["Yes", "No"]
        }
      ]
    }
  ]
  
  #object.task_blocks = [object.task_blocks[1]]

  return object
