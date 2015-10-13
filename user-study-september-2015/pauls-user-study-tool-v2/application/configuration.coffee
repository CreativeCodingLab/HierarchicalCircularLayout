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
      intro_pages: [
        {
          name: "intro"
          text: "Study 1.1-2"
          # text: "Welcome to the study."
          # options: continue_button
          images: [ "IntroPic_small.jpg" ]
          options: continue_button
        }
        # {
        #   text: "height and degree intro 2"
        #   options: continue_button
        # }
      ]
      question_pages: [
        {
          questionName: "height?"
          text: "What is the &nbsp;<span style='font-weight: 800; color: red'>depth</span>&nbsp; of the tree shown?"
          options: options_a
        },
        {
          questionName: "degree?"
          text: "What is the &nbsp;<span style='font-weight: 800; color: blue'>degree</span>&nbsp; of the tree shown?"
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
      intro_pages: [
        {
          name: "intro"
          text: "Study 1.3"
          images: [ "Study1.3/introImage/example3.png"]
          options: continue_button
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
          text: "Study 2.1"
          images: [ "Study2.1/introImage/intro_small.png"]
          options: continue_button
        }
        # {
        #   text: "height and degree intro 2"
        #   options: continue_button
        # }
      ]
      question_pages: [
        {
          questionName: "hops?"
          text: "How many hops are on the path between
            the node highlighted
            in &nbsp;<span style='color: #dd0'> yellow </span>&nbsp; and
            the node highlighted
            in &nbsp;<span style='color: #0d0'> green </span>&nbsp;?"
          options: options_a
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
          text: "Study 2.2"
          images: [ "Study2.2/introImage/intro.png"]
          options: continue_button
        }
      ]
      question_pages: [
        {
          questionName: "connected?"
          text: "[Connected question]?"
          options: options_a
        }
      ]
    }

  ]

  return object
